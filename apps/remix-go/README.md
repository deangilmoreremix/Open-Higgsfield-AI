# Remix-Go: Standalone Video Editor

Remix-Go is a **standalone video editing application** that can run independently within the deangilmoreremix/Open-Higgsfield-AI repository.

## 🚀 Features

- **Complete Video Editor**: Timeline-based editing with drag & drop
- **Stock Media Integration**: Search and use Pexels stock photos/videos
- **AI Content Generation**: Generate images and videos with AI prompts
- **Template System**: Pre-built video templates
- **Campaign Management**: Email, social media, and retargeting campaigns
- **Supabase Integration**: Cloud storage and database

## 🎯 Standalone Operation

Remix-Go is designed as a **self-contained application** with:

- ✅ **Independent dependencies** (own package.json)
- ✅ **Standalone build system** (Vite configuration)
- ✅ **Isolated routing** (React Router)
- ✅ **Dedicated stores** (MobX state management)
- ✅ **Own API layer** (Supabase integration)

## 🏃‍♂️ Running Remix-Go

### Option 1: As Part of Main Application
```bash
# Run the full Higgsfield application (recommended)
npm run dev
# Remix-Go will be available at: http://localhost:8080/apps/remix-go/
```

### Option 2: Standalone Mode
```bash
# Run remix-go independently
npm run dev:remix-go
# Remix-Go will be available at: http://localhost:5173/
```

### Option 3: Manual Standalone
```bash
# Navigate to remix-go directory
cd apps/remix-go

# Install dependencies (if needed)
npm install

# Run development server
npm run dev
```

## 📁 Project Structure

```
apps/remix-go/
├── src/
│   ├── components/        # React components
│   │   ├── editor/        # Video editor components
│   │   ├── campaigns/     # Campaign management
│   │   ├── modals/        # Modal dialogs
│   │   └── workspaces/    # Media selection workspaces
│   ├── lib/               # Utilities and services
│   │   ├── api.js         # Supabase API client
│   │   ├── pexels.js      # Pexels stock media service
│   │   └── popcorn/       # Video editing engine
│   ├── pages/             # Route pages
│   ├── stores/            # MobX state management
│   └── services/          # Application services
├── public/                # Static assets
├── package.json           # Dependencies
├── vite.config.js         # Build configuration
└── index.html             # Entry point
```

## 🔧 Configuration

### Environment Variables
Create `apps/remix-go/.env.local`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Pexels API (for stock media)
VITE_PEXELS_API_KEY=your-pexels-api-key

# Application Settings
VITE_API_BASE_URL=http://localhost:1340
VITE_WL_DOMAIN=videoremix.io
VITE_DEFAULT_USER_ID=demo-user
```

### Pexels API Setup
1. Sign up at [Pexels Developer](https://www.pexels.com/api/)
2. Get your API key
3. Add to `.env.local` as `VITE_PEXELS_API_KEY`

## 🎬 Media Features

### Stock Media
- **Stock Images**: Search millions of Pexels photos
- **Stock Videos**: Browse and use Pexels video clips
- **Preview**: Click to preview before using
- **Download**: Save to personal library
- **Integration**: Drag directly into video editor

### AI Content
- **AI Images**: Generate images from text prompts
- **AI Videos**: Create videos with AI prompts
- **Templates**: Pre-built content structures

### User Media
- **Upload**: Import your own videos/images
- **Library**: Organized media collection
- **Search**: Find media across all sources

## 🛠️ Development

### Adding New Features
1. Create components in `src/components/`
2. Add routes in `src/pages/`
3. Update stores in `src/stores/`
4. Add API methods in `src/lib/api.js`

### Building for Production
```bash
# Build remix-go
npm run build:remix-go

# Or build standalone
cd apps/remix-go && npm run build
```

## 🔌 API Integration

Remix-Go integrates with multiple services:

- **Supabase**: Database, authentication, file storage
- **Pexels API**: Stock photos and videos
- **React/Redux**: State management
- **Fabric.js**: Canvas-based editing

## 📚 Architecture

### Three-Phase Workflow
1. **Getting Started**: Select templates, upload media, choose AI content
2. **Editor**: Timeline-based video editing with canvas overlays
3. **Publisher**: Export and manage campaigns

### Component Architecture
- **Pages**: Route-level components
- **Workspaces**: Media selection interfaces
- **Editor**: Canvas and timeline components
- **Modals**: Dialog and overlay components

## 🤝 Contributing

Remix-Go is designed as a **modular, extensible** video editor. To add new features:

1. Follow the existing component patterns
2. Use MobX stores for state management
3. Integrate with the Supabase API layer
4. Add proper TypeScript types (if applicable)

## 📄 License

Part of the deangilmoreremix/Open-Higgsfield-AI project.