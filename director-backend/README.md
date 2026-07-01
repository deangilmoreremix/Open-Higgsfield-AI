# Director Backend

Render-hosted Express service that exposes 45 VideoDB-powered agent endpoints for the Director app.

## Quick Start

```bash
cd director-backend
cp .env.example .env
# Fill in VIDEO_DB_API_KEY, SUPABASE_*, OPENAI_API_KEY, ENCRYPTION_KEY
npm install
npm start
```

Server runs on `http://localhost:3001`.

## Endpoints

- `GET /health` - Health check
- `GET /api/agents` - List all 45 agents
- `POST /api/agents/:agentId` - Run an agent (requires Supabase JWT)
- `GET /api/integrations` - List user's integrations
- `POST /api/integrations` - Save an integration
- `DELETE /api/integrations/:type` - Remove
- `POST /api/integrations/test/:type` - Test before saving
- `GET /api/jobs/:id` - Get job status
- `GET /api/jobs` - List user's recent jobs

## The 45 Agents

All in `agents/` directory. See `agents/index.js` for the registry.

Categories:
- **analysis** (2): summarizer, scenes
- **extract** (3): clipper, highlighter, auto_highlights
- **translate** (1): dubbing
- **search** (5): search, visual_search, keyword_search, comparison, compilation
- **audio** (4): voiceover, voice_cloning, audio_overlays, ai_voiceovers
- **accessibility** (2): subtitler, subtitle_agent
- **create** (15): preview, thumbnail, story, compiler, montage, musicvideo, trailer, text_to_movie, storyboarding, meme, year_in_frames, faceless_video_creator, ai_ad_films, tiktok_lyric_video, trailer_narration, kids_storyteller
- **edit** (3): editor, speed, reverse
- **enhance** (4): broll, color, enhancer, stabilize
- **social** (1): social
- **integrations** (2): slack_agent, sales_assistant
- **safety** (1): profanity_remover
- **create (output)** (1): output_formatting

## Deployment

Deployed via `render.yaml` blueprint. Set env vars in Render dashboard.

## Tests

```bash
npm test
```

## Architecture

See `docs/superpowers/specs/2026-06-30-director-backend-render-videodb-design.md`.
