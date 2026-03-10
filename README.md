# Open Higgsfield AI

> **The free, open-source alternative to Higgsfield AI.** Generate AI images and videos using 200+ state-of-the-art models — without the closed ecosystem or subscription fees.

![Studio Demo](docs/assets/studio_demo.webp)

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Architecture](#architecture)
7. [Core Features](#core-features)
   - [Image Generation](#image-generation)
   - [Video Generation](#video-generation)
   - [Cinema Studio](#cinema-studio)
   - [Template System](#template-system)
   - [AI Model Integration](#ai-model-integration)
8. [API Reference](#api-reference)
   - [Authentication](#authentication)
   - [Endpoints](#endpoints)
   - [Method Signatures](#method-signatures)
9. [Database Schema](#database-schema)
10. [Usage Examples](#usage-examples)
11. [Contributing](#contributing)
12. [License](#license)
13. [Troubleshooting](#troubleshooting)
14. [Credits](#credits)

---

## Project Overview

Open Higgsfield AI is an open-source AI image, video, and cinema studio that brings Higgsfield-style creative workflows to everyone. Powered by [Muapi.ai](https://muapi.ai), it supports:

- **Text-to-Image** generation (50+ models)
- **Image-to-Image** transformation (55+ models)
- **Text-to-Video** generation (40+ models)
- **Image-to-Video** animation (60+ models)
- **Video-to-Video** processing

### Why Open Higgsfield AI?

| Feature | Higgsfield AI | Open Higgsfield AI |
|---------|---------------|---------------------|
| **Cost** | Subscription-based | Free (open-source) |
| **Models** | Proprietary | 200+ open & commercial models |
| **Multi-image input** | Limited | Up to 14 images per request |
| **Self-hosting** | No | Yes |
| **Customizable** | No | Fully hackable |
| **Data privacy** | Cloud-based | Your data stays local |
| **Source code** | Closed | MIT licensed |

---

## Features

### Core Studios

| Studio | Description |
|--------|-------------|
| **Image Studio** | Dual-mode t2i/i2i generation with 50+ t2i and 55+ i2i models |
| **Video Studio** | Dual-mode t2v/i2v generation with 40+ t2v and 60+ i2v models |
| **Cinema Studio** | Professional camera controls with lens, focal length, aperture |
| **Effects Studio** | 350+ visual effects and motion controls |
| **Edit Studio** | Image editing tools (upscale, background removal, object eraser) |
| **Character Studio** | Consistent character generation with reference images |
| **Storyboard Studio** | Multi-frame storyboard creation |
| **Commercial Studio** | Product photography and advertising content |
| **Upscale Studio** | AI image enhancement (2x-4x) |
| **Influencer Studio** | Social media optimized generation |

### Key Capabilities

- **Multi-Image Input** — Upload up to 14 reference images for compatible models
- **Upload History** — Local storage of uploaded images with reuse capability
- **Generation History** — Browse, revisit, and download past generations
- **Smart Controls** — Dynamic aspect ratio, resolution/quality, duration pickers
- **API Key Management** — Secure localStorage storage (only sent to Muapi)
- **Responsive Design** — Dark glassmorphism UI, works on desktop and mobile
- **One-Click Download** — Full resolution image/video download

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS v4 |
| **Frontend** | Vanilla JavaScript |
| **AI API Gateway** | Muapi.ai |
| **Database** | Supabase (optional) |
| **Package Manager** | npm |

---

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- A [Muapi.ai](https://muapi.ai) API key

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Anil-matcha/Open-Higgsfield-AI.git
cd Open-Higgsfield-AI

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open `http://localhost:5173` in your browser. You'll be prompted to enter your Muapi API key on first use.

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Supabase Configuration (Optional)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### API Key Setup

1. Get an API key from [Muapi.ai](https://muapi.ai)
2. Enter the API key in the app's settings modal
3. The key is stored securely in your browser's localStorage

### Supabase Setup (Optional)

To enable cloud storage for generations, characters, and storyboards:

1. Create a [Supabase](https://supabase.com) project
2. Run the migrations in `supabase/migrations/`
3. Add your Supabase credentials to the `.env` file

```bash
# Apply migrations
supabase db push
```

---

## Architecture

### Directory Structure

```
src/
├── components/           # UI Components
│   ├── AppsHub.js       # Application launcher hub
│   ├── AuthModal.js     # API key authentication modal
│   ├── CameraControls.js # Cinema studio camera controls
│   ├── CharacterStudio.js # Character creation studio
│   ├── CinemaStudio.js  # Pro cinematography interface
│   ├── CommercialStudio.js # Product photography
│   ├── CommunityPage.js # Community features
│   ├── EditStudio.js    # Image editing tools
│   ├── EffectsStudio.js # VFX and effects
│   ├── ExplorePage.js   # Gallery/exploration
│   ├── Header.js        # App header with navigation
│   ├── ImageStudio.js   # Image generation (t2i/i2i)
│   ├── InfluencerStudio.js # AI influencer content
│   ├── InlineInstructions.js # Tutorial overlays
│   ├── LibraryPage.js   # Generation library
│   ├── MediaPreview.js  # Media display component
│   ├── SettingsModal.js # Settings panel
│   ├── Sidebar.js       # Navigation sidebar
│   ├── StoryboardStudio.js # Storyboard creation
│   ├── TemplateStudio.js # Template-based generation
│   ├── TemplatesPage.js # Template browser
│   ├── UploadPicker.js  # Image upload & history picker
│   ├── UpscaleStudio.js # Image enhancement
│   └── VideoStudio.js   # Video generation (t2v/i2v)
├── lib/                 # Core Libraries
│   ├── muapi.js        # API client for Muapi.ai
│   ├── models.js       # 200+ model definitions
│   ├── router.js       # Client-side routing
│   ├── supabase.js     # Supabase client
│   ├── templates.js    # Template definitions
│   ├── thumbnails.js   # Thumbnail utilities
│   ├── instructions.js # Studio instructions
│   └── uploadHistory.js # Upload history management
├── styles/             # CSS Styles
│   ├── global.css      # Global styles & animations
│   ├── studio.css      # Studio-specific styles
│   └── variables.css   # CSS custom properties
├── main.js             # App entry point
└── style.css           # Tailwind imports
```

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Open Higgsfield AI                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Header     │  │   Sidebar    │  │    Content Area      │  │
│  │  Navigation  │  │   Quick Nav  │  │    (Dynamic Router)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                        Studios (Lazy Loaded)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────────┐   │
│  │  Image   │ │  Video   │ │  Cinema  │ │     Effects     │   │
│  │  Studio  │ │  Studio  │ │  Studio  │ │     Studio      │   │
│  └──────────┘ └──────────┘ └──────────┘ └─────────────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────────┐   │
│  │   Edit   │ │Character │ │ Upscale  │ │    Template     │   │
│  │  Studio  │ │  Studio  │ │  Studio  │ │     Studio      │   │
│  └──────────┘ └──────────┘ └──────────┘ └─────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                        Core Libraries                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────────┐   │
│  │  Router  │ │  Muapi   │ │  Models  │ │   Supabase      │   │
│  │  (SPA)   │ │  Client  │ │  (200+)  │ │   (Optional)    │   │
│  └──────────┘ └──────────┘ └──────────┘ └─────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                        External Services                          │
│  ┌──────────────────────────┐  ┌────────────────────────────┐    │
│  │      Muapi.ai API        │  │      Supabase DB          │    │
│  │  (AI Model Gateway)      │  │    (Cloud Storage)        │    │
│  └──────────────────────────┘  └────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Input → Component → Muapi Client → Muapi API → Polling → Display
                ↓
          Local Storage
          (API Key, History)
                ↓
          Supabase (Optional)
          (Cloud Backup)
```

---

## Core Features

### Image Generation

The **Image Studio** provides dual-mode generation:

| Mode | Trigger | Models | Prompt Required |
|------|---------|--------|-----------------|
| **Text-to-Image** | Default (no image) | 50+ models | Yes |
| **Image-to-Image** | Reference image uploaded | 55+ models | Optional |

#### Supported Aspect Ratios

- 1:1 (Square)
- 16:9 (Landscape)
- 9:16 (Portrait)
- 4:3, 3:4
- 3:2, 2:3
- 21:9 (Ultrawide)

#### Multi-Image Support

Models supporting multiple reference images:

| Model | Max Images |
|-------|-----------|
| Nano Banana 2 Edit | 14 |
| Flux Kontext Dev I2I | 10 |
| GPT-4o Edit | 10 |
| Kling O1 Edit Image | 10 |
| Bytedance Seedream Edit | 10 |
| Vidu Q2 Reference to Image | 7 |
| Flux 2 Flex/Pro Edit | 8 |

### Video Generation

The **Video Studio** follows the same dual-mode pattern:

| Mode | Trigger | Models | Prompt Required |
|------|---------|--------|-----------------|
| **Text-to-Video** | Default (no image) | 40+ models | Yes |
| **Image-to-Video** | Start frame uploaded | 60+ models | Optional |

#### Video Parameters

- **Duration**: 3-15 seconds (model dependent)
- **Resolution**: 480p, 720p, 1080p
- **Quality**: basic, high

#### Video Extension

The **Seedance 2.0 Extend** model allows seamless continuation of any Seedance 2.0 generation, preserving style, motion, and audio.

### Cinema Studio

Professional cinematography controls for photorealistic shots:

#### Camera Types
- Modular 8K Digital
- Full-Frame Cine Digital
- Grand Format 70mm Film
- Studio Digital S35
- Classic 16mm Film
- Premium Large Format Digital

#### Lens Options
- Creative Tilt
- Compact Anamorphic
- Extreme Macro
- 70s Cinema Prime
- Classic Anamorphic
- Premium Modern Prime
- Warm Cinema Prime
- Swirl Bokeh Portrait
- Vintage Prime
- Halation Diffusion
- Clinical Sharp Prime

#### Focal Lengths
- 8mm (Ultra-Wide)
- 14mm
- 24mm
- 35mm (Human Eye)
- 50mm (Portrait)
- 85mm (Tight Portrait)

#### Apertures
- f/1.4 (Shallow DoF)
- f/4 (Balanced)
- f/11 (Deep Focus)

### Template System

52 pre-built templates organized by category:

#### Social Media
- TikTok Video Creator
- Instagram Reel Generator
- YouTube Thumbnail
- Reaction Thumbnail
- Short-Form Ad
- Story Highlight Cover
- Profile Picture Generator
- Banner Creator

#### Style Transfer
- Anime Converter
- Comic Book Style
- GTA Loading Screen
- Pixel Art Creator
- Ghibli Style
- Cyberpunk Style
- VHS Retro
- Film Noir
- Disney/Pixar Style
- Lego Style
- Squid Game Style

#### Commercial
- Product Hero Shot
- Product Photography
- Billboard Ad
- ASMR Video
- Product Placement
- Unboxing Scene

#### VFX & Action
- Building Explosion
- Car Explosion
- Disintegration
- Electricity/Lightning
- Tornado
- Fire Breath
- Bullet Time Scene
- Drone FPV Shot
- Dolly Zoom
- Car Chase Scene
- Matrix Shot

#### Portrait & Creator
- Face Swap
- Gender Swap
- Age Progression
- Younger Self
- Fashion Stride
- Glamour Portrait
- Action Figure
- Superhero Transform
- 3D Figurine
- Glass Ball

#### Decade & Era
- 1920s Style
- 1950s Style
- 1970s Style
- 1980s Style

### AI Model Integration

#### Text-to-Image Models (50+)
- Flux Dev, Flux Schnell, Flux 2 Dev/Flex/Pro
- Nano Banana, Nano Banana Pro, Nano Banana 2
- Seedream 5.0, Bytedance Seedream v3/v4/v4.5
- Midjourney v7
- GPT-4o, GPT Image 1.5
- Ideogram v3
- Google Imagen4
- SDXL
- Wan 2.1/2.5/2.6
- Hunyuan Image 2.1/3.0
- Kling O1
- Qwen Image
- Sora, Veo 3

#### Image-to-Image Models (55+)
- Nano Banana Edit/Pro Edit/2 Edit
- Flux Kontext Dev/Pro/Max I2I
- Flux Redux, Flux Pulid
- GPT-4o Edit, GPT Image 1.5 Edit
- Midjourney v7 I2I
- Seededit v3
- Bytedance Seedream Edit
- Qwen Image Edit
- Wan Image Edit
- Ideogram Character
- AI Background Remover
- AI Face Swap
- AI Dress Change
- AI Skin Enhancer
- AI Product Shot

#### Text-to-Video Models (40+)
- Kling v2.1/v2.5/v2.6/v3.0
- Sora, Sora 2
- Veo 3, Veo 3.1
- Seedance Lite/Pro/v1.5/v2.0
- Seedance 2.0 Extend
- Wan 2.1/2.2/2.5/2.6
- Hunyuan, Hailuo 02/2.3
- Runway Gen-3
- Pixverse v4.5/v5/v5.5
- Vidu v2.0
- LTX 2 Pro
- OVI, Grok Imagine

#### Image-to-Video Models (60+)
- Kling I2V (all versions)
- Veo3 I2V
- Runway I2V
- Wan I2V
- Midjourney v7 I2V
- Hunyuan I2V
- Seedance I2V
- Pixverse I2V
- Vidu Q1/Q2 Reference
- Hailuo I2V
- Sora 2 I2V
- OVI I2V
- LTX 2 I2V
- Leonardoai Motion 2.0

#### Video-to-Video Models
- AI Video Watermark Remover

---

## API Reference

### Base URLs

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:5173/api` (via Vite proxy) |
| Production | `https://api.muapi.ai` |

### Authentication

```http
Header: x-api-key: YOUR_API_KEY
```

> **Note:** The API key is stored in browser localStorage and is only sent to Muapi.ai servers, never to any third party.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/{model-endpoint}` | Submit generation task |
| `GET` | `/api/v1/predictions/{request_id}/result` | Poll for results |
| `POST` | `/api/v1/upload_file` | Upload image/video file |

### Generation Flow

1. **Submit** — `POST /api/v1/{model-endpoint}` with prompt and parameters
2. **Receive** — Get `request_id` from response
3. **Poll** — `GET /api/v1/predictions/{request_id}/result` until status is `completed`

### Method Signatures

#### `muapi.generateImage(params)`

```javascript
// Parameters
{
  model: string,           // Model ID (e.g., 'flux-dev', 'nano-banana-2')
  prompt: string,          // Text prompt
  negative_prompt?: string,
  aspect_ratio?: string,   // e.g., '1:1', '16:9', '9:16'
  resolution?: string,    // e.g., '1024x1024', '2048x2048'
  quality?: string,        // e.g., 'basic', 'high'
  image_url?: string,     // For i2i mode
  strength?: number,      // I2I strength (default: 0.6)
  seed?: number           // Random seed (-1 for random)
}

// Returns
{ url: string, ... }
```

#### `muapi.generateVideo(params)`

```javascript
// Parameters
{
  model: string,           // Model ID (e.g., 'kling-v3.0-pro')
  prompt?: string,
  request_id?: string,     // For video extension
  aspect_ratio?: string,
  duration?: number,       // e.g., 5, 10, 15 (seconds)
  resolution?: string,
  quality?: string,
  image_url?: string      // For i2v mode
}

// Returns
{ url: string, ... }
```

#### `muapi.generateI2I(params)`

```javascript
// Parameters
{
  model: string,           // I2I model ID
  image_url: string,       // Reference image URL
  images_list?: string[], // For multi-image models (up to 14)
  prompt?: string,
  aspect_ratio?: string,
  resolution?: string,
  quality?: string
}

// Returns
{ url: string, ... }
```

#### `muapi.generateI2V(params)`

```javascript
// Parameters
{
  model: string,           // I2V model ID
  image_url: string,       // Start frame image URL
  prompt?: string,
  aspect_ratio?: string,
  duration?: number,
  resolution?: string,
  quality?: string
}

// Returns
{ url: string, ... }
```

#### `muapi.processV2V(params)`

```javascript
// Parameters
{
  model: string,           // V2V model ID (e.g., 'video-watermark-remover')
  video_url: string        // Input video URL
}

// Returns
{ url: string, ... }
```

#### `muapi.uploadFile(file)`

```javascript
// Parameters
file: File                 // Image/video file object

// Returns
string                     // Hosted URL of uploaded file
```

#### `muapi.pollForResult(requestId, key, maxAttempts, interval)`

```javascript
// Parameters
requestId: string,         // Request ID from submit response
key: string,               // API key
maxAttempts?: number,     // Default: 60 (~2 min), 120 for video (~4 min)
interval?: number         // Default: 2000ms

// Returns
{
  status: 'completed' | 'succeeded' | 'failed',
  outputs?: [...],
  url?: string
}
```

---

## Database Schema

### Tables

#### `generations`

Stores user generation history.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `type` | text | 'image' or 'video' |
| `url` | text | Generated content URL |
| `prompt` | text | The prompt used |
| `model` | text | AI model used |
| `parameters` | jsonb | Full generation parameters |
| `studio` | text | Which studio was used |
| `template_id` | text | Template ID if from template |
| `user_key` | text | Hashed API key for user separation |
| `created_at` | timestamptz | Creation timestamp |

#### `characters`

Stores saved character references for consistent generation.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `name` | text | Character name |
| `reference_image_url` | text | Reference face URL |
| `style_notes` | text | Style/description notes |
| `user_key` | text | Hashed API key |
| `created_at` | timestamptz | Creation timestamp |

#### `storyboards`

Stores storyboard projects.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `title` | text | Storyboard title |
| `frames` | jsonb | Array of frame objects |
| `user_key` | text | Hashed API key |
| `created_at` | timestamptz | Creation timestamp |

#### `featured_generations`

Public featured content.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `url` | text | Content URL |
| `prompt` | text | The prompt used |
| `model` | text | AI model used |
| `category` | text | Category for filtering |
| `featured_at` | timestamptz | Featured timestamp |

#### `thumbnails`

Studio and template thumbnails.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `target_type` | text | 'studio' or 'template' |
| `target_id` | text | Studio or template ID |
| `image_path` | text | Public file path |
| `alt_text` | text | Accessibility description |
| `prompt_used` | text | AI generation prompt |
| `created_at` | timestamptz | Creation timestamp |

#### `instructions`

Studio instructions and tutorials.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `studio_id` | text | Studio slug (unique) |
| `title` | text | Display title |
| `steps` | jsonb | Array of step objects |
| `quick_tips` | jsonb | Array of tip strings |
| `updated_at` | timestamptz | Last update timestamp |

### Row Level Security

- **generations, characters, storyboards**: Users can only access their own data (matched by `user_key`)
- **featured_generations**: Publicly readable
- **thumbnails, instructions**: Readable by authenticated users

---

## Usage Examples

### Basic Image Generation

```javascript
import { muapi } from './lib/muapi.js';

async function generateImage() {
  const result = await muapi.generateImage({
    model: 'flux-dev',
    prompt: 'A futuristic cityscape at sunset',
    aspect_ratio: '16:9',
    resolution: '1024x1024'
  });
  
  console.log('Generated image URL:', result.url);
}
```

### Image-to-Image Transformation

```javascript
async function transformImage() {
  // First upload the reference image
  const imageUrl = await muapi.uploadFile(referenceImageFile);
  
  // Then transform it
  const result = await muapi.generateI2I({
    model: 'flux-kontext-dev-i2i',
    image_url: imageUrl,
    prompt: 'Transform into anime style'
  });
  
  console.log('Transformed image URL:', result.url);
}
```

### Video Generation

```javascript
async function generateVideo() {
  const result = await muapi.generateVideo({
    model: 'kling-v3.0-pro',
    prompt: 'A drone view of ocean waves crashing',
    aspect_ratio: '16:9',
    duration: 5,
    quality: 'high'
  });
  
  console.log('Generated video URL:', result.url);
}
```

### Image-to-Video Animation

```javascript
async function animateImage() {
  const imageUrl = await muapi.uploadFile(startFrameFile);
  
  const result = await muapi.generateI2V({
    model: 'kling-v2.1-pro-i2v',
    image_url: imageUrl,
    prompt: 'Camera slowly pans right',
    duration: 5
  });
  
  console.log('Animated video URL:', result.url);
}
```

### Multi-Image Input

```javascript
async function multiImageGeneration() {
  // Upload multiple reference images
  const imagesList = await Promise.all(
    imageFiles.map(file => muapi.uploadFile(file))
  );
  
  const result = await muapi.generateI2I({
    model: 'nano-banana-2-edit',
    images_list: imagesList,  // Up to 14 images
    prompt: 'Create a composition with all these elements'
  });
  
  console.log('Result URL:', result.url);
}
```

---

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run the development server (`npm run dev`)
5. Test your changes
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Style

- Use Vanilla JavaScript (no frameworks)
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Troubleshooting

### Common Issues

#### API Key Not Working

**Problem:** Getting "API Key missing" error.

**Solution:**
1. Get a fresh API key from [Muapi.ai](https://muapi.ai)
2. Clear localStorage and re-enter the key
3. Check the key is stored: `localStorage.getItem('muapi_key')`

#### CORS Errors in Development

**Problem:** CORS errors when calling API.

**Solution:** The Vite proxy handles CORS automatically in development. Make sure you're running `npm run dev` (not a direct server).

#### Image Upload Failing

**Problem:** File upload returns an error.

**Solution:**
1. Check file format (supports JPG, PNG, WebP)
2. Check file size limits (varies by model)
3. Try a different image

#### Generation Timeout

**Problem:** Generation takes too long and times out.

**Solution:**
1. Video generation can take 1-3 minutes
2. Increase `maxAttempts` in polling (default is 60 for images, 120 for videos)
3. Try a faster model

### Getting Help

- [GitHub Issues](https://github.com/Anil-matcha/Open-Higgsfield-AI/issues)
- [Muapi.ai Documentation](https://muapi.ai/docs)

---

## Credits

Built with [Muapi.ai](https://muapi.ai) — the unified API for AI image and video generation models.

- [Project Repository](https://github.com/Anil-matcha/Open-Higgsfield-AI)
- [Technical Deep Dive](https://medium.com/@anilmatcha/building-open-higgsfield-ai-an-open-source-ai-cinema-studio-83c1e0a2a5f1)

---

*Open Higgsfield AI — The free, open-source alternative to Higgsfield AI for unlimited creative possibilities.*
