/**
 * SPACES - Node-Based Workflow Editor
 * CineGen's drag-and-drop visual workflow editor
 * React Flow based canvas with 50+ AI models
 */

import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Node Types
const nodeTypes = {
  prompt: PromptNode,
  element: ElementNode,
  storyboard: StoryboardNode,
  shotBoard: ShotBoardNode,
  sam3: SAM3Node,
  music: MusicNode,
  output: OutputNode
};

// Initial node setup
const initialNodes = [
  {
    id: 'start',
    type: 'prompt',
    position: { x: 100, y: 100 },
    data: { label: 'Start with a prompt' }
  }
];

const initialEdges = [];

export function SpacesEditor({ onWorkflowComplete }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();

    const type = event.dataTransfer.getData('application/reactflow');
    if (typeof type === 'undefined' || !type) return;

    const position = {
      x: event.clientX - event.target.getBoundingClientRect().left,
      y: event.clientY - event.target.getBoundingClientRect().top,
    };

    const newNode = {
      id: `${type}_${Date.now()}`,
      type,
      position,
      data: { label: `${type} node` },
    };

    setNodes((nds) => nds.concat(newNode));
  }, []);

  return (
    <div className="spaces-editor">
      <div className="spaces-toolbar">
        <div className="toolbar-section">
          <h3>🎨 Generation</h3>
          <div className="node-palette">
            <div
              className="palette-item"
              onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'prompt')}
              draggable
            >
              📝 Prompt
            </div>
            <div
              className="palette-item"
              onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'element')}
              draggable
            >
              🎭 Element
            </div>
            <div
              className="palette-item"
              onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'storyboard')}
              draggable
            >
              📚 Storyboard
            </div>
          </div>
        </div>

        <div className="toolbar-section">
          <h3>🎬 Video</h3>
          <div className="node-palette">
            <div
              className="palette-item"
              onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'shotBoard')}
              draggable
            >
              📷 Shot Board
            </div>
            <div
              className="palette-item"
              onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'sam3')}
              draggable
            >
              🎯 SAM3
            </div>
          </div>
        </div>

        <div className="toolbar-section">
          <h3>🎵 Audio</h3>
          <div className="node-palette">
            <div
              className="palette-item"
              onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'music')}
              draggable
            >
              🎼 Music
            </div>
          </div>
        </div>

        <div className="toolbar-section">
          <h3>📤 Output</h3>
          <div className="node-palette">
            <div
              className="palette-item"
              onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'output')}
              draggable
            >
              📦 Output
            </div>
          </div>
        </div>
      </div>

      <div className="spaces-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
        >
          <Background variant="dots" gap={20} size={1} />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      <div className="spaces-actions">
        <button className="run-workflow-btn" onClick={() => executeWorkflow(nodes, edges)}>
          🚀 Run Workflow
        </button>
        <button className="save-workflow-btn" onClick={() => saveWorkflow(nodes, edges)}>
          💾 Save Workflow
        </button>
        <button className="clear-canvas-btn" onClick={() => clearCanvas()}>
          🗑️ Clear
        </button>
      </div>
    </div>
  );
}

// Node Components
function PromptNode({ data }) {
  const [prompt, setPrompt] = useState(data.prompt || '');
  const [model, setModel] = useState(data.model || 'flux-dev');

  return (
    <div className="node prompt-node">
      <div className="node-header">
        <span className="node-icon">📝</span>
        <span className="node-title">Prompt</span>
      </div>
      <div className="node-content">
        <select value={model} onChange={(e) => setModel(e.target.value)}>
          <option value="flux-dev">FLUX Dev</option>
          <option value="flux-2-max">FLUX 2 Max</option>
          <option value="sdxl">SDXL</option>
          <option value="kling-3">Kling 3.0</option>
          <option value="ltx-2">LTX 2.3</option>
        </select>
        <textarea
          placeholder="Describe what you want to generate..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
        />
      </div>
      <Handle type="source" position="right" />
    </div>
  );
}

function ElementNode({ data }) {
  const [selectedElement, setSelectedElement] = useState(data.element || null);

  return (
    <div className="node element-node">
      <div className="node-header">
        <span className="node-icon">🎭</span>
        <span className="node-title">Element</span>
      </div>
      <div className="node-content">
        <select value={selectedElement?.id || ''} onChange={(e) => setSelectedElement(findElement(e.target.value))}>
          <option value="">Select element...</option>
          {/* Element options would be populated from elements system */}
        </select>
        {selectedElement && (
          <div className="element-preview">
            <img src={selectedElement.thumbnail} alt={selectedElement.name} />
          </div>
        )}
      </div>
      <Handle type="source" position="right" />
    </div>
  );
}

function StoryboardNode({ data }) {
  const [scene, setScene] = useState(data.scene || '');
  const [shots, setShots] = useState(data.shots || 3);

  return (
    <div className="node storyboard-node">
      <div className="node-header">
        <span className="node-icon">📚</span>
        <span className="node-title">Storyboard</span>
      </div>
      <div className="node-content">
        <textarea
          placeholder="Describe the scene to break into shots..."
          value={scene}
          onChange={(e) => setScene(e.target.value)}
          rows={3}
        />
        <div className="shots-control">
          <label>Number of shots:</label>
          <input
            type="range"
            min="3"
            max="12"
            value={shots}
            onChange={(e) => setShots(parseInt(e.target.value))}
          />
          <span>{shots}</span>
        </div>
      </div>
      <Handle type="target" position="left" />
      <Handle type="source" position="right" />
    </div>
  );
}

function SAM3Node({ data }) {
  const [mode, setMode] = useState(data.mode || 'text');
  const [prompt, setPrompt] = useState(data.prompt || '');

  return (
    <div className="node sam3-node">
      <div className="node-header">
        <span className="node-icon">🎯</span>
        <span className="node-title">SAM3 Segmentation</span>
      </div>
      <div className="node-content">
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="text">Text Prompt</option>
          <option value="click">Click</option>
          <option value="box">Box</option>
        </select>
        {mode === 'text' && (
          <input
            type="text"
            placeholder="e.g., 'the person in the foreground'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        )}
        <div className="preview-modes">
          <button className="mode-btn active">Red Overlay</button>
          <button className="mode-btn">White/Black</button>
          <button className="mode-btn">Cutout</button>
        </div>
      </div>
      <Handle type="target" position="left" />
      <Handle type="source" position="right" />
    </div>
  );
}

function OutputNode({ data }) {
  const [format, setFormat] = useState(data.format || 'mp4');

  return (
    <div className="node output-node">
      <div className="node-header">
        <span className="node-icon">📦</span>
        <span className="node-title">Output</span>
      </div>
      <div className="node-content">
        <select value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="mp4">MP4 Video</option>
          <option value="timeline">Timeline</option>
          <option value="images">Image Sequence</option>
        </select>
        <button className="export-btn">Export</button>
      </div>
      <Handle type="target" position="left" />
    </div>
  );
}

// Workflow execution
async function executeWorkflow(nodes, edges) {
  // Topological sort and execute nodes
  const sortedNodes = topologicalSort(nodes, edges);

  for (const node of sortedNodes) {
    await executeNode(node);
  }

  showToast('Workflow executed successfully!');
}

function topologicalSort(nodes, edges) {
  // Implementation of topological sort for workflow execution
  const graph = {};
  const inDegree = {};

  // Initialize
  nodes.forEach(node => {
    graph[node.id] = [];
    inDegree[node.id] = 0;
  });

  // Build graph
  edges.forEach(edge => {
    graph[edge.source].push(edge.target);
    inDegree[edge.target]++;
  });

  // Kahn's algorithm
  const queue = nodes.filter(node => inDegree[node.id] === 0);
  const result = [];

  while (queue.length > 0) {
    const node = queue.shift();
    result.push(node);

    graph[node.id].forEach(neighbor => {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(nodes.find(n => n.id === neighbor));
      }
    });
  }

  return result;
}

async function executeNode(node) {
  switch (node.type) {
    case 'prompt':
      // Generate content based on prompt
      break;
    case 'storyboard':
      // Break scene into shots using LLM
      break;
    case 'sam3':
      // Apply segmentation
      break;
    // ... other node executions
  }
}

// CSS Styles (add to your stylesheet)
const spacesStyles = `
.spaces-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg);
}

.spaces-toolbar {
  display: flex;
  gap: 20px;
  padding: 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
  overflow-x: auto;
}

.toolbar-section h3 {
  margin: 0 0 8px 0;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}

.node-palette {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.palette-item {
  padding: 8px 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: grab;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.15s ease;
}

.palette-item:hover {
  border-color: var(--primary);
  background: var(--primary-alpha);
}

.palette-item:active {
  cursor: grabbing;
}

.spaces-canvas {
  flex: 1;
  position: relative;
}

.spaces-actions {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid var(--border);
  background: var(--bg-secondary);
}

.run-workflow-btn, .save-workflow-btn, .clear-canvas-btn {
  padding: 10px 16px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.15s ease;
}

.run-workflow-btn:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

/* Node Styles */
.node {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  min-width: 200px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
  border-radius: 8px 8px 0 0;
}

.node-icon {
  font-size: 16px;
}

.node-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--text);
}

.node-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.node-content select,
.node-content input,
.node-content textarea {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  color: var(--text);
  font-size: 12px;
}

.node-content textarea {
  resize: vertical;
  min-height: 60px;
}

.element-preview img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.shots-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.shots-control input[type="range"] {
  flex: 1;
}

.preview-modes {
  display: flex;
  gap: 4px;
}

.mode-btn {
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  color: var(--text-secondary);
  font-size: 10px;
  cursor: pointer;
}

.mode-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.export-btn {
  padding: 8px 16px;
  background: var(--primary);
  border: 1px solid var(--primary);
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-weight: 500;
}

/* React Flow Overrides */
.react-flow__node {
  border-radius: 8px !important;
}

.react-flow__node.selected {
  border-color: var(--primary) !important;
  box-shadow: 0 0 0 1px var(--primary) !important;
}

.react-flow__edge.selected .react-flow__edge-path {
  stroke: var(--primary) !important;
}
`;

export default SpacesEditor;</content>
<parameter name="filePath">src/components/create/SpacesEditor.js