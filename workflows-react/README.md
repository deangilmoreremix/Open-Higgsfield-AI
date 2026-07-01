# Workflows - Standalone React App

A standalone, node-based AI workflow builder for generative image and video pipelines.

## Features

- **Visual Workflow Editor** - Drag and drop nodes to build complex AI pipelines
- **Multiple Node Types** - Text, Image, Video, Audio, API, and Utility nodes
- **Real-time Preview** - See generation results inline
- **Template System** - Start from pre-built workflow templates
- **Local Storage** - Save workflows locally without a backend
- **Demo Mode** - Works without API keys (uses mock generation)
- **API Integration** - Connect to MuAPI and OpenAI when keys are available

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## API Keys

To enable real AI generation, add your API keys:

1. Click "Add API Key" in the header
2. Enter your MuAPI key (from muapi.ai)
3. Optionally add OpenAI key for text generation

## Workflow Types

### Text Node
- Generate text using GPT models
- System prompt support
- Prompt chaining

### Image Node
- Generate images using FLUX, SD3, and other models
- Aspect ratio selection
- Quality settings

### Video Node
- Generate videos from prompts
- Start frame support
- Duration settings

### Audio Node
- Generate music and audio
- Audio processing

### Utility Nodes
- **Prompt Concat** - Combine multiple prompts
- **Video Combiner** - Join multiple videos

## Tech Stack

- **React 18** - UI framework
- **React Flow** - Node-based editor
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## Project Structure

```
workflows-react/
├── src/
│   ├── main.jsx           # Entry point
│   ├── App.jsx             # Root component
│   ├── routes.jsx          # Route definitions
│   ├── context/
│   │   └── WorkflowContext.jsx  # State management
│   ├── components/
│   │   ├── AppShell.jsx    # App layout
│   │   ├── NodePalette.jsx # Add node panel
│   │   ├── NodesNavbar.jsx # Toolbar
│   │   ├── PropertiesPanel.jsx # Node inspector
│   │   ├── OutputPanel.jsx # Results display
│   │   └── RunOverlay.jsx  # Run status
│   ├── pages/
│   │   ├── WorkflowsPage.jsx    # Workflow list
│   │   ├── WorkflowBuilderPage.jsx  # Editor
│   │   └── TemplatesPage.jsx    # Browse templates
│   ├── nodes/
│   │   ├── TextNode.jsx
│   │   ├── ImageNode.jsx
│   │   ├── VideoNode.jsx
│   │   ├── AudioNode.jsx
│   │   ├── ApiNode.jsx
│   │   ├── ConcatNode.jsx
│   │   └── VidConcatNode.jsx
│   ├── services/
│   │   ├── workflowService.js
│   │   └── workflowExecutionService.js
│   ├── adapters/
│   │   ├── muapiAdapter.js
│   │   └── openaiAdapter.js
│   └── data/
│       ├── nodeDefinitions.js
│       └── workflowTemplates.js
└── package.json
```

## Demo Mode

The app works in demo mode without API keys:
- Image generation returns random picsum.photos images
- Video generation returns sample videos
- Text generation returns mock responses
- All workflow features remain functional

## Building

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

## License

MIT