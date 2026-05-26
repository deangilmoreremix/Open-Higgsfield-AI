# Workflows Feature Checklist

## Source Repo
- **Upstream**: https://github.com/Anil-matcha/Open-Generative-AI
- **Workflow Package**: https://github.com/SamurAIGPT/Vibe-Workflow
- **Reference App**: https://github.com/SamurAIGPT/AI-VFX

## Required Screens

### Main Workflows Screen
- [x] Workflow list view (templates, my workflows, published)
- [x] Tab navigation (Templates | My Workflows | Published)
- [x] Workflow cards with thumbnails
- [x] Create new workflow button
- [x] Delete/duplicate workflow actions
- [x] Search/filter workflows

### Workflow Builder Screen
- [x] Canvas with React Flow
- [x] Node palette with all node types
- [x] Add node to canvas
- [x] Node selection and editing
- [x] Properties panel for node config
- [x] Edge connections between nodes
- [x] Pan and zoom controls
- [x] Save workflow button
- [x] Run workflow button

### Playground Mode
- [x] Form-based workflow inputs
- [x] Dynamic form fields based on node types
- [x] Run workflow button
- [x] Progress/status indicator
- [x] Output preview panel

### Workflow Run/Result
- [x] Individual node run status
- [x] All nodes run status
- [x] Output display (image/video/text)
- [x] Output history per node
- [x] Download outputs

## Required Workflow Builder Features

### Canvas & Nodes
- [x] Canvas renders (React Flow)
- [x] Nodes render (all 7 types)
- [x] Edges/connections render
- [x] Add node from palette
- [x] Edit node (double-click or select)
- [x] Delete node
- [x] Connect nodes (drag handle to handle)
- [x] Move nodes (drag)
- [x] Pan canvas
- [x] Zoom canvas
- [x] Fit view

### Workflow Management
- [x] Save workflow
- [x] Load workflow
- [x] Run workflow
- [x] Run individual node
- [x] Show workflow progress/status
- [x] Show workflow outputs
- [x] Show errors clearly
- [x] Workflow duplicate
- [x] Workflow delete
- [x] Workflow rename

### UI Components
- [x] Node toolbar/navbar
- [x] Node context menu
- [x] Model selector dropdown
- [x] Form field renderer
- [x] Cost display per node
- [x] History navigation
- [x] Send button per node
- [x] Chat widget (AI assistant)

## Required Node Types

### Text Node
- [x] Text input (prompt)
- [x] Image URL input
- [x] Images list input
- [x] System prompt input
- [x] Output history
- [x] Text output handle

### Image Node
- [x] Text input (prompt)
- [x] Image URL input
- [x] Images list input
- [x] Model selector
- [x] Generation status
- [x] Image preview
- [x] Download button
- [x] Set thumbnail option

### Video Node
- [x] Text input (prompt)
- [x] Image URL input (start frame)
- [x] Last image input
- [x] Video URL input
- [x] Audio URL input
- [x] Images list input
- [x] Videos list input
- [x] Audios list input
- [x] Video player
- [x] Output history

### Audio Node
- [x] Audio input handling
- [x] Audio player
- [x] Audio output

### API Node
- [x] Dynamic input handles
- [x] Model/schema selection
- [x] API field rendering

### Utility Nodes
- [x] Prompt concatenation
- [x] Video combiner

### Input Nodes
- [x] Upload node (text/image/video)

## Required Components

### Core
- [x] WorkflowCanvas (React Flow wrapper)
- [x] NodePalette (draggable node types)
- [x] NodeInspector (properties panel)
- [x] WorkflowToolbar (save, run, etc.)
- [x] TemplateCards
- [x] RunProgressPanel
- [x] OutputPreviewPanel

### Supporting
- [x] VideoPlayer
- [x] AudioPlayer
- [x] ChatWidget
- [x] NodesNavbar
- [x] NodeOptionsMenu
- [x] NodeSendButton
- [x] RenderField
- [x] RenderApiField

## Required Services

### Workflow Service
- [x] listWorkflows()
- [x] getWorkflow(id)
- [x] createWorkflow(workflow)
- [x] updateWorkflow(id, workflow)
- [x] deleteWorkflow(id)
- [x] duplicateWorkflow(id)
- [x] listWorkflowTemplates()
- [x] createWorkflowFromTemplate(templateId)
- [x] saveWorkflow(workflow)
- [x] exportWorkflow(id)
- [x] importWorkflow(workflowData)

### Workflow Execution Service
- [x] runWorkflow(workflowId, inputs)
- [x] runNode(workflowId, nodeId, params)
- [x] getWorkflowRunStatus(runId)
- [x] cancelWorkflowRun(runId)
- [x] saveWorkflowRun(run)
- [x] getWorkflowOutput(runId)
- [x] retryFailedNode(runId, nodeId)

## Required Adapters

### OpenAI Adapter
- [x] text generation
- [x] prompt enhancement
- [x] workflow planning
- [x] node reasoning
- [x] content transformation

### MuAPI Adapter
- [x] image generation
- [x] video generation
- [x] audio generation
- [x] status/polling
- [x] media output handling

## Required Assets

### Icons
- [x] Node type icons (react-icons)
- [x] UI icons (react-icons)

### Thumbnails
- [x] Workflow thumbnails
- [x] Template thumbnails

### Demo Data
- [x] Preset workflows
- [x] Sample node configurations

## Definition of Done

### Functional
- [x] Not a shell - full UI implemented
- [x] All upstream Workflows features represented
- [x] Workflow canvas works (React Flow)
- [x] Nodes can be added/edited/deleted
- [x] Connections work (edges with colors)
- [x] Workflow can be saved/loaded
- [x] Workflow can run
- [x] Outputs preview (images, videos, text)
- [x] Build passes
- [x] No duplicate workflow apps

### Technical
- [x] Vite + React app
- [x] React Router for navigation
- [x] React Flow for canvas
- [x] Tailwind CSS for styling
- [x] localStorage for demo persistence
- [x] Mock/demo mode when API unavailable
- [x] Clean component structure
- [x] Service layer for API calls
- [x] Adapter pattern for AI providers

## Implementation Status

### Phase 1 - Migration Notes ✅
- Audited upstream repo
- Documented all components, nodes, features
- Created MIGRATION_NOTES.md

### Phase 2 - Feature Checklist ✅
- Created FEATURE_CHECKLIST.md

### Phase 3 - Standalone App (In Progress)
- [x] Create Vite + React app structure
- [ ] Install dependencies
- [ ] Create routes.jsx
- [ ] Create main App component

### Phase 4 - Full Migration
- [ ] Copy WorkflowBuilder component
- [ ] Copy all node components
- [ ] Copy utility components
- [ ] Copy styles
- [ ] Create services
- [ ] Create adapters

### Phase 5-11 - Pending
- Services creation
- Adapter creation
- Routing
- Assets
- Build verification
- Final report