from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks, HTTPException, Depends, Header
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, validator
import asyncio
import os
import json
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Optional, List
from pathlib import Path
from dotenv import load_dotenv
from pipelines.idea2video_pipeline import Idea2VideoPipeline
from pipelines.script2video_pipeline import Script2VideoPipeline
from pipelines.novel2movie_pipeline import Novel2MoviePipeline

# Load environment variables
load_dotenv()

# Authentication
security = HTTPBearer()
API_KEY = os.getenv("API_KEY")

# Pydantic Models for Request Validation
class VideoGenerationRequest(BaseModel):
    user_id: str = Field(default="anonymous", description="User identifier")
    pipeline_type: str = Field(default="idea2video", description="Type of pipeline to use")
    idea: str = Field(default="", description="Idea for video generation")
    script: str = Field(default="", description="Script content")
    user_requirement: str = Field(default="", description="User requirements")
    style: str = Field(default="Realistic", description="Visual style")
    image_generator: str = Field(default="google", description="Image generator to use")
    video_generator: str = Field(default="google", description="Video generator to use")
    quality: str = Field(default="standard", description="Quality setting")
    resolution: str = Field(default="1080p", description="Video resolution")
    format: str = Field(default="mp4", description="Video format")

    @validator('pipeline_type')
    def validate_pipeline_type(cls, v):
        allowed = ['idea2video', 'script2video', 'novel2video', 'cameo']
        if v not in allowed:
            raise ValueError(f'Pipeline type must be one of: {allowed}')
        return v

    @validator('quality')
    def validate_quality(cls, v):
        quality_map = {'fast': 'standard'}
        v = quality_map.get(v, v)
        allowed = ['standard', 'high', 'ultra']
        if v not in allowed:
            raise ValueError(f'Quality must be one of: {allowed}')
        return v

    @validator('resolution')
    def validate_resolution(cls, v):
        allowed = ['720p', '1080p', '4k']
        if v not in allowed:
            raise ValueError(f'Resolution must be one of: {allowed}')
        return v

class BatchJobRequest(BaseModel):
    pipeline_type: str
    idea: str = ""
    script: str = ""
    user_requirement: str = ""
    style: str = "Realistic"
    image_generator: str = "google"
    video_generator: str = "google"
    quality: str = "standard"
    resolution: str = "1080p"
    format: str = "mp4"

class BatchCreationRequest(BaseModel):
    name: str
    jobs: List[BatchJobRequest]

    @validator('jobs')
    def validate_jobs(cls, v):
        if len(v) == 0:
            raise ValueError('At least one job must be provided')
        if len(v) > 10:
            raise ValueError('Maximum 10 jobs allowed per batch')
        return v

def verify_api_key(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify API key from Authorization header"""
    if not API_KEY:
        # If no API key is set, allow all requests (for development)
        return True

    if credentials.credentials != API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Invalid API key",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return True

def validate_file_upload(file: UploadFile, allowed_types: List[str] = None, max_size: int = None) -> None:
    """Validate uploaded file"""
    if not file:
        return

    # Check file size
    if max_size is None:
        max_size = int(os.getenv("MAX_UPLOAD_SIZE", "10485760"))  # 10MB default

    file_content = file.file.read()
    file.file.seek(0)  # Reset file pointer

    if len(file_content) > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum allowed size of {max_size} bytes"
        )

    # Check file type
    if allowed_types is None:
        allowed_types = os.getenv("ALLOWED_FILE_TYPES", "pdf,txt,doc,docx").split(",")

    file_extension = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
    if file_extension not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{file_extension}' not allowed. Allowed types: {', '.join(allowed_types)}"
        )

# WebSocket support
from fastapi import WebSocket
from fastapi.websockets import WebSocketDisconnect

app = FastAPI(title="ViMax Web API", description="AI-powered video generation from ideas")

# Add CORS middleware
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001")
if allowed_origins == "*":
    allow_origins = ["*"]
else:
    allow_origins = [origin.strip() for origin in allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global pipeline instances
pipelines = {}


def create_image_generator(name: str, rate_limiter=None):
    from tools.factory import build_image_generator
    return build_image_generator(name, rate_limiter)

# Job status storage directory
JOB_STATUS_DIR = Path("job_status")
JOB_STATUS_DIR.mkdir(exist_ok=True)

# User data storage directory
USER_DATA_DIR = Path("user_data")
USER_DATA_DIR.mkdir(exist_ok=True)

# Batch processing
BATCH_DATA_DIR = Path("batch_data")
BATCH_DATA_DIR.mkdir(exist_ok=True)
active_batches = {}  # batch_id -> batch_info
batch_queue = []  # Queue of batch jobs
max_concurrent_batches = 2

# Asset caching
CACHE_DIR = Path("cache")
CACHE_DIR.mkdir(exist_ok=True)
CACHE_INDEX_FILE = CACHE_DIR / "cache_index.json"
CACHE_EXPIRY_DAYS = 7  # Cache entries expire after 7 days

# Load cache index
def load_cache_index():
    if CACHE_INDEX_FILE.exists():
        try:
            with open(CACHE_INDEX_FILE, 'r') as f:
                return json.load(f)
        except:
            return {}
    return {}

# Save cache index
def save_cache_index(index):
    with open(CACHE_INDEX_FILE, 'w') as f:
        json.dump(index, f, indent=2)

# Generate cache key from parameters
def generate_cache_key(params: dict) -> str:
    # Sort keys for consistent hashing
    param_str = json.dumps(params, sort_keys=True)
    return hashlib.md5(param_str.encode()).hexdigest()

# Check if cached asset exists and is valid
def get_cached_asset(cache_key: str) -> Optional[Path]:
    cache_index = load_cache_index()
    if cache_key in cache_index:
        cache_entry = cache_index[cache_key]
        cache_path = CACHE_DIR / cache_entry['filename']

        # Check if file exists and hasn't expired
        if cache_path.exists():
            created_time = datetime.fromisoformat(cache_entry['created'])
            if datetime.now() - created_time < timedelta(days=CACHE_EXPIRY_DAYS):
                return cache_path

        # Remove expired entry
        del cache_index[cache_key]
        save_cache_index(cache_index)
        if cache_path.exists():
            cache_path.unlink()

    return None

# Store asset in cache
def cache_asset(cache_key: str, source_path: Path, params: dict) -> Path:
    cache_index = load_cache_index()

    # Generate unique filename
    ext = source_path.suffix
    cache_filename = f"{cache_key}{ext}"
    cache_path = CACHE_DIR / cache_filename

    # Copy file to cache
    import shutil
    shutil.copy2(source_path, cache_path)

    # Update cache index
    cache_index[cache_key] = {
        'filename': cache_filename,
        'created': datetime.now().isoformat(),
        'params': params,
        'original_path': str(source_path)
    }
    save_cache_index(cache_index)

    return cache_path

# Clean expired cache entries
def clean_expired_cache():
    cache_index = load_cache_index()
    current_time = datetime.now()
    expired_keys = []

    for key, entry in cache_index.items():
        created_time = datetime.fromisoformat(entry['created'])
        if current_time - created_time > timedelta(days=CACHE_EXPIRY_DAYS):
            expired_keys.append(key)
            cache_path = CACHE_DIR / entry['filename']
            if cache_path.exists():
                cache_path.unlink()

    # Remove expired entries from index
    for key in expired_keys:
        del cache_index[key]

    if expired_keys:
        save_cache_index(cache_index)
        logger.info(f"Cleaned {len(expired_keys)} expired cache entries")

# Logging and Monitoring Setup
LOGS_DIR = Path("logs")
LOGS_DIR.mkdir(exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOGS_DIR / "vimax.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("vimax")

# Error tracking
ERROR_LOGS_DIR = LOGS_DIR / "errors"
ERROR_LOGS_DIR.mkdir(exist_ok=True)

# Performance monitoring
PERF_LOGS_DIR = LOGS_DIR / "performance"
PERF_LOGS_DIR.mkdir(exist_ok=True)

def log_error(error_type: str, error_message: str, user_id: str = None, job_id: str = None, extra_data: dict = None):
    """Log errors with structured data"""
    error_data = {
        "timestamp": datetime.now().isoformat(),
        "error_type": error_type,
        "message": error_message,
        "user_id": user_id,
        "job_id": job_id,
        "extra_data": extra_data or {}
    }

    # Log to main logger
    logger.error(f"{error_type}: {error_message}", extra={
        "user_id": user_id,
        "job_id": job_id,
        "extra_data": extra_data
    })

    # Save to error log file
    error_log_file = ERROR_LOGS_DIR / f"errors_{datetime.now().strftime('%Y%m%d')}.jsonl"
    with open(error_log_file, 'a') as f:
        f.write(json.dumps(error_data) + '\n')

def log_performance(operation: str, duration: float, user_id: str = None, job_id: str = None, success: bool = True):
    """Log performance metrics"""
    perf_data = {
        "timestamp": datetime.now().isoformat(),
        "operation": operation,
        "duration_seconds": duration,
        "user_id": user_id,
        "job_id": job_id,
        "success": success
    }

    # Log to main logger
    logger.info(f"Performance: {operation} took {duration:.2f}s", extra=perf_data)

    # Save to performance log file
    perf_log_file = PERF_LOGS_DIR / f"performance_{datetime.now().strftime('%Y%m%d')}.jsonl"
    with open(perf_log_file, 'a') as f:
        f.write(json.dumps(perf_data) + '\n')

def get_system_stats():
    """Get system statistics for monitoring"""
    try:
        # Basic stats without psutil
        active_jobs = len([f for f in JOB_STATUS_DIR.iterdir() if f.is_file()])
        try:
            cache_size = sum(f.stat().st_size for f in CACHE_DIR.rglob('*') if f.is_file()) / (1024 * 1024)
        except:
            cache_size = 0

        return {
            "cpu_percent": "N/A (psutil not available)",
            "memory_percent": "N/A (psutil not available)",
            "disk_usage": "N/A (psutil not available)",
            "active_jobs": active_jobs,
            "cache_size_mb": cache_size
        }
    except:
        return {"error": "Could not retrieve system stats"}

def get_pipeline(pipeline_type: str, image_generator: str = "google"):
    """Get or create pipeline instance, keyed by (pipeline_type, image_generator)."""
    actual_pipeline_type = "idea2video" if pipeline_type == "cameo" else pipeline_type
    cache_key = (actual_pipeline_type, image_generator)

    if cache_key not in pipelines:
        if actual_pipeline_type == "idea2video":
            pipelines[cache_key] = Idea2VideoPipeline.init_from_env(image_generator_name=image_generator)
        elif actual_pipeline_type == "script2video":
            from pipelines.script2video_pipeline import Script2VideoPipeline
            pipelines[cache_key] = Script2VideoPipeline.init_from_config(
                "configs/script2video.yaml", image_generator_name=image_generator
            )
        elif actual_pipeline_type == "novel2video":
            pipelines[cache_key] = Novel2MoviePipeline.init_from_config(
                "configs/script2video.yaml", image_generator_name=image_generator
            )
        else:
            raise ValueError(f"Unknown pipeline type: {pipeline_type}")
    return pipelines[cache_key]

# WebSocket connection manager with enhanced reliability
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}
        self.connection_status: dict[str, str] = {}  # 'connecting', 'connected', 'disconnected', 'error'
        self.message_queues: dict[str, list] = {}
        self.heartbeat_tasks: dict[str, asyncio.Task] = {}

    async def connect(self, job_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[job_id] = websocket
        self.connection_status[job_id] = 'connected'
        self.message_queues[job_id] = []

        # Start heartbeat monitoring
        self.heartbeat_tasks[job_id] = asyncio.create_task(self._heartbeat_monitor(job_id))

        # Send any queued messages
        await self._send_queued_messages(job_id)

    def disconnect(self, job_id: str):
        if job_id in self.active_connections:
            del self.active_connections[job_id]
        self.connection_status[job_id] = 'disconnected'

        # Cancel heartbeat task
        if job_id in self.heartbeat_tasks:
            self.heartbeat_tasks[job_id].cancel()
            del self.heartbeat_tasks[job_id]

    async def send_status_update(self, job_id: str, status: dict):
        if job_id in self.active_connections and self.connection_status.get(job_id) == 'connected':
            try:
                await self.active_connections[job_id].send_json(status)
            except Exception as e:
                print(f"Failed to send WebSocket message for job {job_id}: {e}")
                self.disconnect(job_id)
                # Queue the message for when connection is restored
                if job_id not in self.message_queues:
                    self.message_queues[job_id] = []
                self.message_queues[job_id].append(status)
        else:
            # Queue message if not connected
            if job_id not in self.message_queues:
                self.message_queues[job_id] = []
            self.message_queues[job_id].append(status)

    async def _send_queued_messages(self, job_id: str):
        """Send any queued messages when connection is restored"""
        if job_id in self.message_queues and self.message_queues[job_id]:
            for message in self.message_queues[job_id]:
                try:
                    await self.active_connections[job_id].send_json(message)
                except Exception as e:
                    print(f"Failed to send queued message for job {job_id}: {e}")
                    break
            self.message_queues[job_id].clear()

    async def _heartbeat_monitor(self, job_id: str):
        """Monitor connection health with periodic pings"""
        while job_id in self.active_connections:
            try:
                await asyncio.sleep(30)  # Ping every 30 seconds
                if job_id in self.active_connections:
                    await self.active_connections[job_id].send_json({"type": "ping"})
            except Exception as e:
                print(f"Heartbeat failed for job {job_id}: {e}")
                self.disconnect(job_id)
                break

    def get_connection_status(self, job_id: str) -> str:
        return self.connection_status.get(job_id, 'disconnected')

manager = ConnectionManager()

def save_job_status(job_id: str, status: dict):
    """Save job status to file"""
    job_file = JOB_STATUS_DIR / f"{job_id}.json"
    with open(job_file, "w") as f:
        json.dump(status, f)

def load_job_status(job_id: str) -> dict:
    """Load job status from file"""
    job_file = JOB_STATUS_DIR / f"{job_id}.json"
    if job_file.exists():
        with open(job_file, "r") as f:
            return json.load(f)
    return None

def save_user_data(user_id: str, user_data: dict):
    """Save user data to file"""
    user_file = USER_DATA_DIR / f"{user_id}.json"
    with open(user_file, "w") as f:
        json.dump(user_data, f, indent=2)

def load_user_data(user_id: str) -> dict:
    """Load user data from file"""
    user_file = USER_DATA_DIR / f"{user_id}.json"
    if user_file.exists():
        with open(user_file, "r") as f:
            return json.load(f)
    # Return default user data
    return {
        "user_id": user_id,
        "created_at": datetime.now().isoformat(),
        "history": [],
        "preferences": {
            "default_pipeline": "idea2video",
            "default_style": "Realistic",
            "default_quality": "standard",
            "theme": "light"
        },
        "stats": {
            "total_generations": 0,
            "total_videos": 0,
            "average_rating": 0,
            "favorite_style": "Realistic"
        },
        "feedback": []
    }

def add_generation_to_history(user_id: str, job_id: str, generation_data: dict):
    """Add a completed generation to user history"""
    user_data = load_user_data(user_id)
    history_entry = {
        "job_id": job_id,
        "timestamp": datetime.now().isoformat(),
        "pipeline_type": generation_data.get("pipeline_type", "idea2video"),
        "idea": generation_data.get("idea", ""),
        "style": generation_data.get("style", "Realistic"),
        "quality": generation_data.get("quality", "standard"),
        "status": "completed",
        "video_url": f"/videos/{job_id}/output.mp4"  # Assuming standard video location
    }

    user_data["history"].insert(0, history_entry)  # Add to beginning
    # Keep only last 50 generations
    user_data["history"] = user_data["history"][:50]

    # Update stats
    user_data["stats"]["total_generations"] += 1
    user_data["stats"]["total_videos"] += 1

    save_user_data(user_id, user_data)

def create_batch(user_id: str, batch_name: str, jobs: list) -> str:
    """Create a new batch job"""
    batch_id = f"batch_{os.urandom(8).hex()}"

    batch_data = {
        "batch_id": batch_id,
        "user_id": user_id,
        "name": batch_name,
        "created_at": datetime.now().isoformat(),
        "jobs": jobs,
        "status": "queued",
        "progress": {"completed": 0, "total": len(jobs), "failed": 0},
        "results": []
    }

    # Save batch data
    batch_file = BATCH_DATA_DIR / f"{batch_id}.json"
    with open(batch_file, "w") as f:
        json.dump(batch_data, f)

    # Add to queue
    batch_queue.append(batch_id)

    # Try to start processing
    process_batch_queue()

    return batch_id

def process_batch_queue():
    """Process batches from the queue"""
    active_count = len([b for b in active_batches.values() if b["status"] == "processing"])

    while active_count < max_concurrent_batches and batch_queue:
        batch_id = batch_queue.pop(0)
        start_batch_processing(batch_id)
        active_count += 1

def start_batch_processing(batch_id: str):
    """Start processing a batch"""
    batch_file = BATCH_DATA_DIR / f"{batch_id}.json"
    if not batch_file.exists():
        return

    with open(batch_file, "r") as f:
        batch_data = json.load(f)

    batch_data["status"] = "processing"
    batch_data["started_at"] = datetime.now().isoformat()

    with open(batch_file, "w") as f:
        json.dump(batch_data, f)

    active_batches[batch_id] = batch_data

    # Start processing jobs in the batch
    asyncio.create_task(process_batch_jobs(batch_id))

async def process_batch_jobs(batch_id: str):
    """Process all jobs in a batch"""
    batch_file = BATCH_DATA_DIR / f"{batch_id}.json"
    if not batch_file.exists():
        return

    with open(batch_file, "r") as f:
        batch_data = json.load(f)

    for i, job in enumerate(batch_data["jobs"]):
        try:
            # Create individual job
            job_id = f"{batch_id}_job_{i}"
            job_data = {
                "user_id": batch_data["user_id"],
                "pipeline_type": job.get("pipeline_type", "idea2video"),
                "idea": job.get("idea", ""),
                "script": job.get("script", ""),
                "user_requirement": job.get("user_requirement", ""),
                "style": job.get("style", "Realistic"),
                "image_generator": job.get("image_generator", "google"),
                "video_generator": job.get("video_generator", "google"),
                "quality": job.get("quality", "standard"),
                "resolution": job.get("resolution", "1080p"),
                "format": job.get("format", "mp4")
            }

            # Process the job (reuse existing pipeline logic)
            await run_pipeline(
                job_id=job_id,
                pipeline_type=job_data["pipeline_type"],
                idea=job_data["idea"],
                script=job_data["script"],
                user_requirement=job_data["user_requirement"],
                style=job_data["style"],
                image_generator=job_data["image_generator"],
                video_generator=job_data["video_generator"],
                quality=job_data["quality"],
                resolution=job_data["resolution"],
                format=job_data["format"],
                script_path=None,
                novel_path=None,
                photo_path=None
            )

            batch_data["progress"]["completed"] += 1
            batch_data["results"].append({
                "job_index": i,
                "job_id": job_id,
                "status": "completed",
                "video_url": f"/videos/{job_id}/output.mp4"
            })

        except Exception as e:
            batch_data["progress"]["failed"] += 1
            batch_data["results"].append({
                "job_index": i,
                "status": "failed",
                "error": str(e)
            })

        # Update batch progress
        with open(batch_file, "w") as f:
            json.dump(batch_data, f)

    # Mark batch as completed
    batch_data["status"] = "completed"
    batch_data["completed_at"] = datetime.now().isoformat()

    with open(batch_file, "w") as f:
        json.dump(batch_data, f)

    # Remove from active batches
    if batch_id in active_batches:
        del active_batches[batch_id]

    # Process next batch in queue
    process_batch_queue()

def get_batch_status(batch_id: str) -> dict:
    """Get batch status"""
    batch_file = BATCH_DATA_DIR / f"{batch_id}.json"
    if batch_file.exists():
        with open(batch_file, "r") as f:
            return json.load(f)
    return None

@app.on_event("startup")
async def startup_event():
    global pipeline
    try:
        pipeline = Idea2VideoPipeline.init_from_env()
        print("Pipeline initialized successfully")
    except Exception as e:
        print(f"Failed to initialize pipeline: {e}")
        # Continue without pipeline for now

@app.post("/generate-video")
async def generate_video(
    background_tasks: BackgroundTasks,
    _auth: bool = Depends(verify_api_key),
    user_id: str = Form("anonymous"),
    pipeline_type: str = Form("idea2video"),  # idea2video, script2video, novel2video
    idea: str = Form(""),
    script: str = Form(""),
    user_requirement: str = Form(""),
    style: str = Form("Realistic"),
    image_generator: str = Form("google"),
    video_generator: str = Form("google"),
    quality: str = Form("standard"),
    resolution: str = Form("1080p"),
    format: str = Form("mp4"),
    script_file: Optional[UploadFile] = File(None),
    novel_file: Optional[UploadFile] = File(None),
    photo_file: Optional[UploadFile] = File(None)
):
    # Validate input parameters
    request_data = VideoGenerationRequest(
        user_id=user_id,
        pipeline_type=pipeline_type,
        idea=idea,
        script=script,
        user_requirement=user_requirement,
        style=style,
        image_generator=image_generator,
        video_generator=video_generator,
        quality=quality,
        resolution=resolution,
        format=format
    )
    start_time = datetime.now()

    if not pipeline:
        log_error("PIPELINE_ERROR", "Pipeline not initialized", user_id)
        raise HTTPException(status_code=500, detail="Pipeline not initialized")

    # Generate unique job ID
    job_id = f"job_{os.urandom(8).hex()}"

    # Check cache for existing asset
    cache_params = {
        "pipeline_type": pipeline_type,
        "idea": idea,
        "script": script,
        "user_requirement": user_requirement,
        "style": style,
        "image_generator": image_generator,
        "video_generator": video_generator,
        "quality": quality,
        "resolution": resolution,
        "format": format,
        # Note: File uploads are not cached for simplicity
    }
    cache_key = generate_cache_key(cache_params)
    cached_asset = get_cached_asset(cache_key)

    if cached_asset and not script_file and not novel_file and not photo_file:
        # Return cached result immediately
        logger.info(f"Cache hit for job {job_id} - returning cached asset")
        log_performance("cache_hit", (datetime.now() - start_time).total_seconds(), user_id, job_id)
        return {
            "job_id": job_id,
            "status": "completed",
            "message": "Video retrieved from cache",
            "cached": True,
            "video_url": f"/cache/{cached_asset.name}"
        }

    # Create job directory
    job_dir = Path(f"videos/{job_id}")
    job_dir.mkdir(parents=True, exist_ok=True)

    # Validate and save uploaded files if provided
    script_path = None
    novel_path = None
    photo_path = None

    if script_file:
        validate_file_upload(script_file)
        script_path = job_dir / f"script_{script_file.filename}"
        with open(script_path, "wb") as f:
            content = await script_file.read()
            f.write(content)

    if novel_file:
        validate_file_upload(novel_file)
        novel_path = job_dir / f"novel_{novel_file.filename}"
        with open(novel_path, "wb") as f:
            content = await novel_file.read()
            f.write(content)

    if photo_file:
        validate_file_upload(photo_file, allowed_types=["jpg", "jpeg", "png", "webp"])
        photo_path = job_dir / f"photo_{photo_file.filename}"
        with open(photo_path, "wb") as f:
            content = await photo_file.read()
            f.write(content)

    if pipeline_type == 'cameo' and not photo_file:
        raise HTTPException(
            status_code=400,
            detail="AutoCameo requires a photo file. Please upload a JPG, PNG, or WebP image."
        )

    # Initialize job status
    initial_status = {
        "status": "processing",
        "progress": 0,
        "message": "Starting video generation...",
        "current_step": "Initializing",
        "step_progress": 0,
        "total_steps": 5,
        "steps": [
            {"name": "Story Generation", "status": "pending", "estimated_time": 30},
            {"name": "Character Extraction", "status": "pending", "estimated_time": 20},
            {"name": "Image Generation", "status": "pending", "estimated_time": 120},
            {"name": "Video Assembly", "status": "pending", "estimated_time": 60},
            {"name": "Final Processing", "status": "pending", "estimated_time": 15}
        ],
        "user_id": user_id,
        "script_path": str(script_path) if script_path else None,
        "photo_path": str(photo_path) if photo_path else None,
        "created_at": str(asyncio.get_event_loop().time())
    }
    save_job_status(job_id, initial_status)

    # Run pipeline in background
    background_tasks.add_task(
        run_pipeline,
        job_id,
        pipeline_type,
        idea,
        script,
        user_requirement,
        style,
        image_generator,
        video_generator,
        quality,
        resolution,
        format,
        script_path,
        novel_path,
        photo_path
    )

    log_performance("job_queued", (datetime.now() - start_time).total_seconds(), user_id, job_id)
    return {
        "job_id": job_id,
        "status": "processing",
        "message": "Video generation started"
    }

async def update_step_status(current_status, step_index, status="in_progress"):
    """Update the status of a specific step"""
    if "steps" in current_status:
        for i, step in enumerate(current_status["steps"]):
            if i < step_index:
                current_status["steps"][i]["status"] = "completed"
            elif i == step_index:
                current_status["steps"][i]["status"] = status
            else:
                current_status["steps"][i]["status"] = "pending"

        current_status["current_step"] = current_status["steps"][step_index]["name"]
        current_status["step_progress"] = (step_index / len(current_status["steps"])) * 100

async def run_pipeline(
    job_id: str,
    pipeline_type: str,
    idea: str,
    script: str,
    user_requirement: str,
    style: str,
    image_generator: str,
    video_generator: str,
    quality: str,
    resolution: str,
    format: str,
    script_path: Optional[Path],
    novel_path: Optional[Path],
    photo_path: Optional[Path]
):
    pipeline_start_time = datetime.now()
    current_status = {}

    try:
        # Load current status
        current_status = load_job_status(job_id) or {}

        # Step 1: Story Generation
        await update_step_status(current_status, 0)
        current_status["message"] = "Generating story from your idea..."
        current_status["progress"] = 10
        save_job_status(job_id, current_status)
        await manager.send_status_update(job_id, current_status)
        await asyncio.sleep(2)  # Simulate processing time

        # Step 2: Character Extraction
        await update_step_status(current_status, 1)
        current_status["message"] = "Extracting characters and setting the scene..."
        current_status["progress"] = 25
        save_job_status(job_id, current_status)
        await manager.send_status_update(job_id, current_status)
        await asyncio.sleep(1)

        # Step 3: Image Generation (this takes the longest)
        await update_step_status(current_status, 2)
        current_status["message"] = "Creating visual assets and images..."
        current_status["progress"] = 40
        placeholder_scene_count = 5
        current_status["scenes"] = [
            {
                "scene_index": i,
                "status": "generating",
                "image_url": None,
                "camera_angle": None,
                "duration_seconds": 4,
                "script_line": None,
            }
            for i in range(placeholder_scene_count)
        ]
        save_job_status(job_id, current_status)
        await manager.send_status_update(job_id, current_status)

        # Get the appropriate pipeline (keyed by type + image generator)
        pipeline = get_pipeline(pipeline_type, image_generator)

        # Execute based on pipeline type
        if pipeline_type in ["idea2video", "cameo"]:
            await pipeline(idea=idea, user_requirement=user_requirement, style=style)
        elif pipeline_type == "script2video":
            script_content = script
            if script_path:
                with open(script_path, 'r', encoding='utf-8') as f:
                    script_content = f.read()
            await pipeline(script=script_content, user_requirement=user_requirement, style=style)
        elif pipeline_type == "novel2video":
            novel_content = script
            if novel_path:
                with open(novel_path, 'r', encoding='utf-8') as f:
                    novel_content = f.read()
            await pipeline(novel_text=novel_content, style=style)

        # Scan job directory for generated images and build real scene list
        job_dir = Path(f"videos/{job_id}")
        image_extensions = {".png", ".jpg", ".jpeg", ".webp"}
        image_files = sorted([
            f for f in job_dir.glob("*")
            if f.is_file() and f.suffix.lower() in image_extensions
        ]) if job_dir.exists() else []
        if image_files:
            current_status["scenes"] = [
                {
                    "scene_index": i,
                    "status": "completed",
                    "image_url": f"/videos/{job_id}/{f.name}",
                    "camera_angle": None,
                    "duration_seconds": 4,
                    "script_line": None,
                }
                for i, f in enumerate(image_files)
            ]
        else:
            current_status["scenes"] = []
        save_job_status(job_id, current_status)
        await manager.send_status_update(job_id, current_status)

        # Step 4: Video Assembly
        await update_step_status(current_status, 3)
        current_status["message"] = "Assembling video from generated images..."
        current_status["progress"] = 75
        save_job_status(job_id, current_status)
        await manager.send_status_update(job_id, current_status)
        await asyncio.sleep(1)

        # Step 5: Final Processing
        await update_step_status(current_status, 4)
        current_status["message"] = "Finalizing video and adding finishing touches..."
        current_status["progress"] = 90
        save_job_status(job_id, current_status)
        await manager.send_status_update(job_id, current_status)
        await asyncio.sleep(1)

        pipeline_duration = (datetime.now() - pipeline_start_time).total_seconds()
        current_status["status"] = "completed"
        current_status["progress"] = 100
        current_status["message"] = "Video generation completed successfully!"
        await update_step_status(current_status, 4, "completed")
        save_job_status(job_id, current_status)
        await manager.send_status_update(job_id, current_status)

        # Log successful completion
        user_id = current_status.get("user_id", "unknown")
        log_performance("pipeline_completed", pipeline_duration, user_id, job_id, True)
        logger.info(f"Pipeline completed successfully for job {job_id} in {pipeline_duration:.2f}s")

        # Cache the generated video for future use (only for non-file uploads)
        if not script_path and not novel_path and not photo_path:
            try:
                # Find the generated video file
                job_dir = Path(f"videos/{job_id}")
                video_files = list(job_dir.glob("*.mp4")) + list(job_dir.glob("*.webm"))
                if video_files:
                    video_path = video_files[0]  # Take the first video file
                    cache_params = {
                        "pipeline_type": pipeline_type,
                        "idea": idea,
                        "script": script,
                        "user_requirement": user_requirement,
                        "style": style,
                        "image_generator": image_generator,
                        "video_generator": video_generator,
                        "quality": quality,
                        "resolution": resolution,
                        "format": format,
                    }
                    cache_key = generate_cache_key(cache_params)
                    cache_asset(cache_key, video_path, cache_params)
                    print(f"Cached video for job {job_id} with key {cache_key}")
            except Exception as cache_error:
                print(f"Warning: Failed to cache video for job {job_id}: {cache_error}")

        # Save to user history if user_id is provided
        if "user_id" in current_status:
            generation_data = {
                "pipeline_type": pipeline_type,
                "idea": idea,
                "script": script,
                "style": style,
                "quality": quality,
                "resolution": resolution,
                "format": format
            }
            add_generation_to_history(current_status["user_id"], job_id, generation_data)

    except Exception as e:
        pipeline_duration = (datetime.now() - pipeline_start_time).total_seconds()
        current_status = load_job_status(job_id) or {}
        user_id = current_status.get("user_id", "unknown")

        error_msg = f"Pipeline execution failed: {str(e)}"
        current_status["status"] = "failed"
        current_status["message"] = f"Error: {str(e)}"
        save_job_status(job_id, current_status)
        await manager.send_status_update(job_id, current_status)

        log_error("PIPELINE_EXECUTION_ERROR", error_msg, user_id, job_id, {
            "pipeline_type": pipeline_type,
            "stage": current_status.get("current_step", "unknown"),
            "progress": current_status.get("progress", 0),
            "error_details": str(e)
        })
        log_performance("pipeline_failed", pipeline_duration, user_id, job_id, False)
        logger.error(f"Pipeline execution failed for job {job_id}: {e}")

class EnhanceTextRequest(BaseModel):
    text: str = Field(..., description="The text to enhance")
    pipeline_type: str = Field(default="idea2video", description="Pipeline type context")


@app.post("/enhance-text")
async def enhance_text(
    request: EnhanceTextRequest,
    _auth: bool = Depends(verify_api_key),
):
    text = request.text.strip()
    if len(text) < 10:
        raise HTTPException(status_code=400, detail="Text must be at least 10 characters long.")

    chat_model_name = os.getenv("CHAT_MODEL", "google/gemini-2.5-flash-lite-preview-09-2025")
    model_provider = os.getenv("CHAT_MODEL_PROVIDER", "openai")
    api_key = os.getenv("OPENROUTER_API_KEY")
    base_url = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

    if not api_key:
        raise HTTPException(status_code=500, detail="LLM API key not configured.")

    try:
        if request.pipeline_type in ("idea2video", "cameo"):
            from agents.idea_expander import IdeaExpander
            expander = IdeaExpander(
                chat_model=chat_model_name,
                base_url=base_url,
                api_key=api_key,
                model_provider=model_provider,
            )
            enhanced = await expander.expand_idea(text)
        else:
            from agents.script_enhancer import ScriptEnhancer
            enhancer = ScriptEnhancer(
                chat_model=chat_model_name,
                base_url=base_url,
                api_key=api_key,
                model_provider=model_provider,
            )
            enhanced = await enhancer.enhance_script(text)

        return {"enhanced_text": enhanced}
    except Exception as e:
        logger.error(f"Text enhancement failed: {e}")
        raise HTTPException(status_code=500, detail="Enhancement failed. Please try again.")


@app.get("/job/{job_id}")
async def get_job_status(job_id: str):
    status = load_job_status(job_id)
    if status is None:
        raise HTTPException(status_code=404, detail="Job not found")

    return status

@app.get("/job/{job_id}/download")
async def download_video(job_id: str):
    status = load_job_status(job_id)
    if status is None:
        raise HTTPException(status_code=404, detail="Job not found")

    if status["status"] != "completed":
        raise HTTPException(status_code=400, detail="Video not ready yet")

    # Find the generated video file
    job_dir = Path(f"videos/{job_id}")
    video_files = list(job_dir.glob("*.mp4"))

    if not video_files:
        raise HTTPException(status_code=404, detail="Video file not found")

    video_path = video_files[0]  # Assuming one video per job
    return FileResponse(
        path=video_path,
        media_type="video/mp4",
        filename=f"vimax_video_{job_id}.mp4"
    )

@app.websocket("/ws/job/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    await manager.connect(job_id, websocket)
    try:
        # Send initial status
        status = load_job_status(job_id)
        if status:
            await websocket.send_json(status)
        else:
            # Send connection established message
            await websocket.send_json({
                "status": "connected",
                "message": "WebSocket connection established",
                "connection_status": "connected"
            })

        # Handle incoming messages
        while True:
            try:
                data = await websocket.receive_json()

                # Handle ping/pong for connection health
                if data.get("type") == "pong":
                    # Client responded to our ping
                    continue
                elif data.get("type") == "ping":
                    # Client sent ping, respond with pong
                    await websocket.send_json({"type": "pong"})
                else:
                    # Handle other client messages
                    print(f"Received message from job {job_id}: {data}")

            except Exception as e:
                print(f"Error handling WebSocket message for job {job_id}: {e}")
                break

    except WebSocketDisconnect:
        print(f"WebSocket disconnected for job {job_id}")
        manager.disconnect(job_id)
    except Exception as e:
        print(f"WebSocket error for job {job_id}: {e}")
        manager.disconnect(job_id)

@app.get("/user/{user_id}")
async def get_user_data(user_id: str):
    """Get user data including history and preferences"""
    user_data = load_user_data(user_id)
    return user_data

@app.put("/user/{user_id}/preferences")
async def update_user_preferences(user_id: str, preferences: dict):
    """Update user preferences"""
    user_data = load_user_data(user_id)
    user_data["preferences"].update(preferences)
    save_user_data(user_id, user_data)
    return {"message": "Preferences updated successfully"}

@app.post("/user/{user_id}/feedback")
async def submit_user_feedback(user_id: str, feedback_data: dict):
    """Submit user feedback for analytics"""
    user_data = load_user_data(user_id)
    feedback_entry = {
        "timestamp": datetime.now().isoformat(),
        "job_id": feedback_data.get("job_id"),
        "rating": feedback_data.get("rating"),
        "comments": feedback_data.get("comments", ""),
        "categories": feedback_data.get("categories", [])
    }

    user_data["feedback"].insert(0, feedback_entry)
    user_data["feedback"] = user_data["feedback"][:100]  # Keep last 100 feedback entries

    # Update average rating
    ratings = [f["rating"] for f in user_data["feedback"] if f["rating"]]
    if ratings:
        user_data["stats"]["average_rating"] = sum(ratings) / len(ratings)

    save_user_data(user_id, user_data)
    return {"message": "Feedback submitted successfully"}

@app.post("/batch")
async def create_batch_job(user_id: str, batch_data: BatchCreationRequest, _auth: bool = Depends(verify_api_key)):
    """Create a new batch job"""
    batch_name = batch_data.name or f"Batch {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    jobs = batch_data.jobs

    batch_id = create_batch(user_id, batch_name, jobs)
    return {"batch_id": batch_id, "message": "Batch created successfully"}

@app.get("/batch/{batch_id}")
async def get_batch_status_endpoint(batch_id: str):
    """Get batch status"""
    batch_data = get_batch_status(batch_id)
    if not batch_data:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch_data

@app.get("/user/{user_id}/batches")
async def get_user_batches(user_id: str):
    """Get all batches for a user"""
    batches = []
    for batch_file in BATCH_DATA_DIR.glob("*.json"):
        try:
            with open(batch_file, "r") as f:
                batch_data = json.load(f)
                if batch_data.get("user_id") == user_id:
                    batches.append({
                        "batch_id": batch_data["batch_id"],
                        "name": batch_data["name"],
                        "status": batch_data["status"],
                        "created_at": batch_data["created_at"],
                        "progress": batch_data["progress"],
                        "total_jobs": len(batch_data["jobs"])
                    })
        except:
            continue

    # Sort by creation date (newest first)
    batches.sort(key=lambda x: x["created_at"], reverse=True)
    return {"batches": batches}

@app.on_event("startup")
async def startup_event():
    """Clean expired cache entries on startup"""
    try:
        clean_expired_cache()
        print("Cache cleanup completed on startup")
    except Exception as e:
        print(f"Warning: Cache cleanup failed on startup: {e}")

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "system_stats": get_system_stats()
    }

@app.get("/metrics")
async def get_metrics():
    """Get system metrics and statistics"""
    try:
        # Count various metrics
        total_jobs = len(list(JOB_STATUS_DIR.glob("*.json")))
        active_jobs = 0
        completed_jobs = 0
        failed_jobs = 0

        for job_file in JOB_STATUS_DIR.glob("*.json"):
            try:
                with open(job_file, 'r') as f:
                    job_data = json.load(f)
                    status = job_data.get('status', 'unknown')
                    if status in ['processing', 'queued']:
                        active_jobs += 1
                    elif status == 'completed':
                        completed_jobs += 1
                    elif status == 'failed':
                        failed_jobs += 1
            except:
                continue

        cache_stats = {
            "total_entries": len(load_cache_index()),
            "cache_size_mb": get_system_stats().get("cache_size_mb", 0)
        }

        return {
            "timestamp": datetime.now().isoformat(),
            "jobs": {
                "total": total_jobs,
                "active": active_jobs,
                "completed": completed_jobs,
                "failed": failed_jobs
            },
            "cache": cache_stats,
            "system": get_system_stats(),
            "batches": {
                "active": len(active_batches),
                "queued": len(batch_queue)
            }
        }
    except Exception as e:
        log_error("METRICS_ERROR", f"Failed to retrieve metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve metrics")

@app.get("/")
async def root():
    return FileResponse("frontend/build/index.html", media_type="text/html")

# Mount static files directory for serving generated videos
app.mount("/videos", StaticFiles(directory="videos"), name="videos")

# Mount cache directory for serving cached videos
app.mount("/cache", StaticFiles(directory="cache"), name="cache")

# Mount frontend static files
app.mount("/static", StaticFiles(directory="frontend/build/static"), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)