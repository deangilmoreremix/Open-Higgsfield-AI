# ViMax Setup Guide

## Quick Start

### 1. Environment Setup

Copy the environment template and fill in your API keys:

```bash
cp .env .env.local
```

Edit `.env.local` with your actual API keys:

```bash
# Required API Keys
OPENROUTER_API_KEY=your_openrouter_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
API_KEY=your_chosen_api_key_for_authentication
```

### 2. Install Dependencies

```bash
# Install Python dependencies
pip install uv
uv sync

# Install frontend dependencies
cd frontend
npm install
```

### 3. Run the Application

#### Development Mode

```bash
# Backend
uv run uvicorn web_app:app --reload --host 0.0.0.0 --port 8000

# Frontend (in another terminal)
cd frontend
npm start
```

#### Production Mode with Docker

```bash
# Build and run with Docker Compose
docker-compose up --build
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | OpenRouter API key for chat models | Required |
| `GOOGLE_API_KEY` | Google Gemini API key | Required |
| `API_KEY` | API key for authentication | Optional (dev mode) |
| `APP_PORT` | Application port | 8000 |
| `ALLOWED_ORIGINS` | CORS allowed origins | http://localhost:3000 |
| `MAX_UPLOAD_SIZE` | Max file upload size (bytes) | 10485760 |
| `CHAT_MODEL_RPM` | Chat model requests per minute | 500 |
| `IMAGE_GENERATOR_RPM` | Image generator requests per minute | 10 |

### API Keys Setup

1. **OpenRouter**: Sign up at https://openrouter.ai/ and get your API key
2. **Google Gemini**: Get API key from Google AI Studio
3. **API Key**: Choose a secure key for application authentication

## Usage

1. Open the frontend at http://localhost:3000
2. Enter your API key in the authentication section
3. Select pipeline type (idea2video/script2video)
4. Fill in your idea/script and requirements
5. Click "Generate Video" and wait for completion

## Troubleshooting

### Common Issues

1. **"Pipeline not initialized"**: Check your API keys in `.env`
2. **CORS errors**: Verify `ALLOWED_ORIGINS` includes your frontend URL
3. **Authentication failed**: Ensure API key is set and correct
4. **File upload errors**: Check file size and type restrictions

### Logs

Check logs in the `logs/` directory:
- `vimax.log` - Main application logs
- `errors/` - Error logs
- `performance/` - Performance metrics

## Security Notes

- Never commit API keys to version control
- Use strong, unique API keys
- In production, use HTTPS and proper CORS settings
- Regularly rotate API keys
- Monitor usage and set appropriate rate limits