# Marketing Studio React

Standalone React application for AI-powered marketing video generation.

## Features

- **Product Image Upload** - Upload product images for inclusion in videos
- **Avatar Upload** - Upload or select avatar images with presets
- **Reference Images** - Upload up to 6 additional reference images
- **UGC Style Presets** - Choose from 6 UGC video styles
- **Aspect Ratio Selection** - 9:16, 3:4, 4:3, 16:9, 1:1
- **Resolution Selection** - 720p or 1080p
- **Duration Selection** - 4-15 seconds
- **Prompt Enhancement** - Integrated with OpenAI for prompt optimization
- **Video History** - View and download generated videos
- **Fullscreen Preview** - View videos in fullscreen mode

## Setup

```bash
npm install
npm run dev
```

## Environment Variables

Create a `.env` file in the root:

```bash
VITE_MUAPI_API_KEY=your_muapi_key_here
VITE_OPENAI_API_KEY=your_openai_key_here  # Optional
```

## Build

```bash
npm run build
```

## Tech Stack

- Vite
- React 18
- Tailwind CSS

## Migration Notes

See `src/MIGRATION_NOTES.md` for details on the upstream migration from Open-Generative-AI.