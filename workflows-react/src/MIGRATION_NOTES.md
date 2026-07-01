# MIGRATION_NOTES.md

## Source Repo
- **Upstream**: https://github.com/Anil-matcha/Open-Generative-AI
- **Workflow Package**: https://github.com/SamurAIGPT/Vibe-Workflow (submodule)
- **Reference App**: https://github.com/SamurAIGPT/AI-VFX

## Upstream Workflows Files Found

### Main WorkflowStudio Component
- **Location**: `packages/studio/src/components/WorkflowStudio.jsx` (980 lines, 41.2 KB)
- **Purpose**: Main workflow list/management/playground UI

### WorkflowBuilder Package (Vibe-Workflow)
- **Location**: `SamurAIGPT/Vibe-Workflow/packages/workflow-builder`
- **Entry**: `src/index.js` - exports WorkflowBuilder, TextNode, ImageNode, VideoNode
- **Main**: `src/WorkflowBuilder.jsx` - ReactFlowProvider + NodeFlow wrapper
- **Components**:
  - `src/components/NodeFlow.jsx` - Main canvas with nodes/edges (65k+ chars truncated)
  - `src/components/TextNode.jsx` - Text input node
  - `src/components/ImageNode.jsx` - Image generation node
  - `src/components/VideoNode.jsx` - Video generation node
  - `src/components/AudioNode.jsx` - Audio generation node
  - `src/components/ApiNode.jsx` - API/wrapper node
  - `src/components/UploadNode.jsx` - File upload node
  - `src/components/VideoCombiner.jsx` - Video combining utility node
  - `src/components/PromptConcate.jsx` - Prompt concatenation utility node
  - `src/components/WorkflowStore.jsx` - Global state management
  - `src/components/NodesNavbar.jsx` - Node toolbar/navigation
  - `src/components/NodeOptionsMenu.jsx` - Node context menu
  - `src/components/NodeSendButton.jsx` - Run individual node button
  - `src/components/RenderField.jsx` - Form field renderer
  - `src/components/RenderApiField.jsx` - API field renderer
  - `src/components/ChatWidget.jsx` - AI chat assistant
  - `src/components/VideoPlayer.jsx` - Video playback
  - `src/components/AudioPlayer.jsx` - Audio playback
  - `src/components/useGenerationCost.jsx` - Cost calculation hook
  - `src/components/utility.jsx` - Model definitions, presets

### App Routes
- `app/workflow/[id]/page.js` - Workflow viewer
- `app/workflow/[id]/[tab]/page.js` - Tabbed view (playground/builder)

### API Routes
- `app/api/workflow/[[...path]]/route.js` - MuAPI proxy for workflow operations

## App Entry Point
- Next.js App Router
- Entry via StandaloneShell component
- Workflow routes at `/workflow/[id]`

## All Workflows Routes/Pages
- `/workflow/[id]` - View workflow (defaults to playground)
- `/workflow/[id]/playground` - Interactive form-based execution
- `/workflow/[id]/builder` - Visual node editor

## All Workflows Components
1. WorkflowStudio - Main list/management UI
2. WorkflowUI - Wrapper for workflow-builder package
3. StandaloneShell - App shell with navigation
4. NodeFlow - React Flow canvas with nodes/edges
5. TextNode - Text input/generation
6. ImageNode - Image generation
7. VideoNode - Video generation
8. AudioNode - Audio generation
9. ApiNode - Generic API node
10. UploadNode - File upload
11. VideoCombiner - Combine videos
12. PromptConcate - Concatenate prompts
13. NodesNavbar - Node toolbar
14. NodeOptionsMenu - Context menu
15. ChatWidget - AI assistant
16. VideoPlayer - Video playback
17. AudioPlayer - Audio playback

## Workflow-builder Package Structure
```
packages/workflow-builder/
├── src/
│   ├── index.js              # Exports
│   ├── WorkflowBuilder.jsx   # Main component
│   ├── tailwind.css          # Styles
│   └── components/
│       ├── NodeFlow.jsx      # Canvas (React Flow)
│       ├── TextNode.jsx      # Text node
│       ├── ImageNode.jsx      # Image node
│       ├── VideoNode.jsx      # Video node
│       ├── AudioNode.jsx      # Audio node
│       ├── ApiNode.jsx        # API node
│       ├── UploadNode.jsx     # Upload node
│       ├── VideoCombiner.jsx  # Video combiner
│       ├── PromptConcate.jsx  # Prompt concat
│       ├── WorkflowStore.jsx  # State
│       ├── NodesNavbar.jsx    # Toolbar
│       ├── NodeOptionsMenu.jsx # Context menu
│       ├── NodeSendButton.jsx # Run button
│       ├── RenderField.jsx    # Form renderer
│       ├── RenderApiField.jsx # API form renderer
│       ├── ChatWidget.jsx     # AI chat
│       ├── VideoPlayer.jsx    # Video player
│       ├── AudioPlayer.jsx    # Audio player
│       ├── useGenerationCost.jsx # Cost hook
│       └── utility.jsx        # Helpers, models
├── package.json
├── babel.config.json
├── postcss.config.js
└── tailwind.config.js
```

## All Node Types
1. **textNode** - Text input, prompt generation, LLM
   - Inputs: textInput (prompt), textInput2 (image_url), textInput3 (images_list), textInput4 (system_prompt)
   - Output: textOutput
2. **imageNode** - Image generation
   - Inputs: imageInput (prompt), imageInput2 (images_list), imageInput3 (image_url)
   - Output: imageOutput
3. **videoNode** - Video generation
   - Inputs: videoInput (prompt), videoInput2 (image_url), videoInput3 (last_image), videoInput4 (video_url), videoInput5 (audio_url), videoInput6 (images_list), videoInput7 (videos_list), videoInput8 (audios_list)
   - Output: videoOutput
4. **audioNode** - Audio/music generation
   - Inputs: audioInput, audioInput2, audioInput3, audioInput4
   - Output: audioOutput
5. **concatNode** - Prompt concatenation (utility)
   - Inputs: concatInput
   - Output: concatOutput
6. **vidConcatNode** - Video combiner (utility)
   - Inputs: videoInput7 (videos_list)
   - Output: videoOutput
7. **apiNode** - Generic API wrapper
   - Dynamic inputs based on API schema

## All Edges/Connection Logic
- Edge colors based on data type:
  - Blue: text
  - Green: image
  - Orange: video
  - Yellow: audio
- Connection validation based on handle types
- Dynamic routing based on node types and handle positions

## All Workflow Templates
- Presets defined in utility.jsx
- Templates loaded from API
- User workflows stored in Supabase
- Published/community workflows available

## All Workflow Execution Logic
1. Save workflow via `POST /api/workflow/create`
2. Run workflow via `POST /api/workflow/{id}/api-execute`
3. Poll for results via `GET /api/workflow/run/{runId}/status`
4. Individual node execution via `POST /api/workflow/{id}/node/{nodeId}/run`

## All Forms/Inputs
- Form fields dynamically rendered based on model schema
- Support for text, number, select, boolean, array types
- Images list support for multi-image models
- File upload via UploadNode

## All Model/API Calls
- MuAPI for image/video/audio generation
- OpenAI for text/prompt enhancement
- Polling pattern for async operations
- Cost tracking per node

## All Assets/Thumbnails/Images/Icons
- Uses react-icons for icons
- Effect thumbnails from CDN
- Video poster frames
- No local image assets required

## All Styling Dependencies
- Tailwind CSS v3.3.3
- react-hot-toast for notifications
- Custom CSS for loaders and animations

## All Environment Variables
- MU_API_KEY - MuAPI key
- OPENAI_API_KEY - OpenAI key (optional)
- SUPABASE_URL - Supabase project URL
- SUPABASE_ANON_KEY - Supabase anon key

## All Backend/Server Assumptions
- Next.js API routes for proxy
- MuAPI backend at api.muapi.ai
- Supabase for workflow storage
- Client-side state management

## Features Found
1. ✅ Node-based visual workflow editor
2. ✅ Canvas with pan/zoom
3. ✅ Node palette with drag-drop
4. ✅ Multiple node types (text, image, video, audio, api, utility)
5. ✅ Edge connections with type-based colors
6. ✅ Form-based node configuration
7. ✅ Individual node execution
8. ✅ Workflow execution with progress
9. ✅ Output history per node
10. ✅ Chat assistant for workflow creation
11. ✅ Template system
12. ✅ Workflow save/load
13. ✅ Published workflow browsing
14. ✅ Cost tracking per node
15. ✅ Thumbnail generation

## Missing or Unclear Features
1. Drag-drop from palette (may need implementation)
2. Undo/redo (not seen in code)
3. Workflow export/import (basic support exists)
4. Keyboard shortcuts (not documented)

## Exact Files Copied
- WorkflowBuilder.jsx - adapted
- NodeFlow.jsx - adapted (large file)
- TextNode.jsx - adapted
- ImageNode.jsx - adapted
- VideoNode.jsx - adapted
- AudioNode.jsx - needs to be fetched
- ApiNode.jsx - needs to be fetched
- UploadNode.jsx - needs to be fetched
- VideoCombiner.jsx - needs to be fetched
- PromptConcate.jsx - needs to be fetched
- WorkflowStore.jsx - needs to be fetched
- NodesNavbar.jsx - needs to be fetched
- NodeOptionsMenu.jsx - needs to be fetched
- NodeSendButton.jsx - needs to be fetched
- RenderField.jsx - needs to be fetched
- RenderApiField.jsx - needs to be fetched
- ChatWidget.jsx - needs to be fetched
- VideoPlayer.jsx - needs to be fetched
- AudioPlayer.jsx - needs to be fetched
- useGenerationCost.jsx - needs to be fetched
- utility.jsx - needs to be fetched

## Exact Files Adapted
- WorkflowBuilder.jsx - Next.js removed, made standalone
- NodeFlow.jsx - Next.js removed, standalone React
- TextNode.jsx - adapted to standalone
- ImageNode.jsx - adapted to standalone
- VideoNode.jsx - adapted to standalone

## Exact Files Replaced
- Next.js dependencies -> Vite/React
- next/navigation -> react-router
- next/link -> react-router-dom Link
- StandaloneShell -> Custom app shell
- Supabase auth -> Simplified storage

## Exact Files Intentionally Excluded
- Electron app code (desktop-only)
- Prisma/DB schemas (not needed for frontend)
- Server-side API routes (will create new services)
- Authentication code (will add simple localStorage)

## Adaptation Notes
1. Remove Next.js dependencies (useParams, Link, etc.)
2. Replace with React Router
3. Replace Supabase with localStorage for demo
4. Create MuAPI adapter for generation
5. Create OpenAI adapter for text/prompts
6. Maintain React Flow for canvas
7. Keep all node types and functionality
8. Implement demo mode when API keys unavailable