import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useWorkflow } from '../context/WorkflowContext';
import { getWorkflow, saveWorkflow } from '../services/workflowService';
import { runWorkflow, runNode } from '../services/workflowExecutionService';
import { NODE_TYPES, EDGE_STYLES, getEdgeColor } from '../data/nodeDefinitions';

import TextNodeComponent from '../nodes/TextNode';
import ImageNodeComponent from '../nodes/ImageNode';
import VideoNodeComponent from '../nodes/VideoNode';
import AudioNodeComponent from '../nodes/AudioNode';
import ApiNodeComponent from '../nodes/ApiNode';
import ConcatNodeComponent from '../nodes/ConcatNode';
import VidConcatNodeComponent from '../nodes/VidConcatNode';
import NodesNavbar from '../components/NodesNavbar';
import NodePalette from '../components/NodePalette';
import PropertiesPanel from '../components/PropertiesPanel';
import OutputPanel from '../components/OutputPanel';
import RunOverlay from '../components/RunOverlay';

const nodeTypes = {
  textNode: TextNodeComponent,
  imageNode: ImageNodeComponent,
  videoNode: VideoNodeComponent,
  audioNode: AudioNodeComponent,
  apiNode: ApiNodeComponent,
  concatNode: ConcatNodeComponent,
  vidConcatNode: VidConcatNodeComponent,
};

export default function WorkflowBuilderPage() {
  const { id, tab } = useParams();
  const navigate = useNavigate();
  const { apiKey, isDemoMode, setCurrentWorkflow } = useWorkflow();

  const [nodes, reactFlowSetNodes, onNodesChange] = useNodesState([]);
  const [edges, reactFlowSetEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runStatus, setRunStatus] = useState(null);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [workflowId, setWorkflowId] = useState(id || null);
  const [showPalette, setShowPalette] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const reactFlowWrapper = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (id && id !== 'new' && !isInitialized.current) {
      loadWorkflow(id);
    }
  }, [id]);

  useEffect(() => {
    if (tab === 'playground') {
      setShowProperties(false);
      setShowOutput(true);
    } else if (tab === 'builder') {
      setShowProperties(false);
      setShowOutput(false);
    }
  }, [tab]);

  const loadWorkflow = async (workflowId) => {
    try {
      const workflow = await getWorkflow(workflowId);
      if (workflow) {
        setCurrentWorkflow(workflow);
        setWorkflowName(workflow.name || 'Untitled Workflow');
        setWorkflowId(workflow.id);

        if (workflow.data?.nodes) {
          reactFlowSetNodes(workflow.data.nodes);
        }
        if (workflow.edges) {
          reactFlowSetEdges(workflow.edges);
        }

        isInitialized.current = true;
      }
    } catch (error) {
      console.error('Error loading workflow:', error);
    }
  };

  const onConnect = useCallback((params) => {
    const sourceNode = nodes.find(n => n.id === params.source);
    const targetNode = nodes.find(n => n.id === params.target);
    const edgeColor = getEdgeColor(params.sourceHandle, params.targetHandle, sourceNode, targetNode);

    reactFlowSetEdges((eds) =>
      addEdge(
        {
          ...params,
          style: EDGE_STYLES[edgeColor],
        },
        eds
      )
    );
    setHasChanges(true);
  }, [nodes]);

  const addNode = (type) => {
    const id = `${type.replace('Node', '').toLowerCase()}_${Date.now()}`;
    const position = { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 };

    const newNode = {
      id,
      type,
      position,
      data: {
        label: type.replace('Node', ''),
        formValues: {},
        outputs: [],
        resultUrl: null,
        isLoading: false,
        errorMsg: null,
        outputHistory: [],
        selectedModel: null,
      },
    };

    reactFlowSetNodes((nds) => [...nds, newNode]);
    setHasChanges(true);
    setShowPalette(false);
  };

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setShowProperties(true);
  }, []);

  const onNodeDoubleClick = useCallback((event, node) => {
    setSelectedNode(node);
    setShowProperties(true);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setShowProperties(false);
  }, []);

  const handleSave = async () => {
    try {
      const workflow = {
        id: workflowId,
        name: workflowName,
        edges,
        data: { nodes },
        category: 'General',
      };

      const saved = await saveWorkflow(workflow);
      setWorkflowId(saved.id);
      setCurrentWorkflow(saved);
      setHasChanges(false);
      toast.success('Workflow saved');
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow');
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setRunStatus({ status: 'running' });

    try {
      const workflow = {
        id: workflowId,
        name: workflowName,
        edges,
        data: { nodes },
      };

      const result = await runWorkflow(workflow);
      setRunStatus({ status: 'completed', results: result.results });
      setShowOutput(true);

      updateNodesWithResults(result.results);
    } catch (error) {
      console.error('Error running workflow:', error);
      setRunStatus({ status: 'failed', error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  const updateNodesWithResults = (results) => {
    reactFlowSetNodes((nds) =>
      nds.map((node) => {
        const result = results?.[node.id];
        if (result) {
          return {
            ...node,
            data: {
              ...node.data,
              resultUrl: result.resultUrl,
              outputs: result.outputs || [],
              isLoading: false,
              errorMsg: result.error || null,
              outputHistory: [...(node.data.outputHistory || []), result],
            },
          };
        }
        return node;
      })
    );
  };

  const handleDeleteNode = (nodeId) => {
    reactFlowSetNodes((nds) => nds.filter(n => n.id !== nodeId));
    reactFlowSetEdges((eds) => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
      setShowProperties(false);
    }
    setHasChanges(true);
  };

  const handleDuplicateNode = (node) => {
    const newId = `${node.type.replace('Node', '').toLowerCase()}_${Date.now()}`;
    const newNode = {
      ...node,
      id: newId,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
      data: {
        ...node.data,
        outputHistory: [],
        resultUrl: null,
        outputs: [],
      },
    };
    reactFlowSetNodes((nds) => [...nds, newNode]);
    setHasChanges(true);
  };

  const handleNodeDataChange = (nodeId, newData) => {
    reactFlowSetNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
    setHasChanges(true);
  };

  return (
    <div className="h-full flex flex-col">
      <NodesNavbar
        workflowName={workflowName}
        onNameChange={setWorkflowName}
        onSave={handleSave}
        onRun={handleRun}
        onTogglePalette={() => setShowPalette(!showPalette)}
        onToggleOutput={() => setShowOutput(!showOutput)}
        hasChanges={hasChanges}
        isRunning={isRunning}
        tabs={tab}
        onTabChange={(t) => navigate(t ? `/workflows/${id || 'new'}/${t}` : `/workflows/${id || 'new'}`)}
      />

      <div className="flex-1 flex relative overflow-hidden">
        <div ref={reactFlowWrapper} className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onNodeDoubleClick={onNodeDoubleClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[20, 20]}
            defaultEdgeOptions={{
              style: EDGE_STYLES.blue,
              type: 'smoothstep',
            }}
          >
            <Background color="#1c1e21" gap={20} />
            <Controls />
            <MiniMap
              nodeColor={(n) => {
                switch (n.type) {
                  case 'textNode': return '#3b82f6';
                  case 'imageNode': return '#22c55e';
                  case 'videoNode': return '#f97316';
                  case 'audioNode': return '#eab308';
                  default: return '#71717a';
                }
              }}
              maskColor="rgba(0, 0, 0, 0.8)"
            />

            <Panel position="top-left" className="bg-[#151618] border border-zinc-800 rounded-lg p-2">
              <button
                onClick={() => setShowPalette(!showPalette)}
                className="px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-white rounded transition-colors"
              >
                + Add Node
              </button>
            </Panel>
          </ReactFlow>

          {showPalette && (
            <NodePalette
              onAddNode={addNode}
              onClose={() => setShowPalette(false)}
            />
          )}
        </div>

        {showProperties && selectedNode && (
          <PropertiesPanel
            node={selectedNode}
            onClose={() => setShowProperties(false)}
            onDelete={() => handleDeleteNode(selectedNode.id)}
            onDuplicate={() => handleDuplicateNode(selectedNode)}
            onDataChange={(newData) => handleNodeDataChange(selectedNode.id, newData)}
          />
        )}

        {showOutput && (
          <OutputPanel
            nodes={nodes}
            onClose={() => setShowOutput(false)}
          />
        )}

        {isRunning && (
          <RunOverlay
            status={runStatus}
            onClose={() => {
              setIsRunning(false);
              setRunStatus(null);
            }}
          />
        )}
      </div>
    </div>
  );
}