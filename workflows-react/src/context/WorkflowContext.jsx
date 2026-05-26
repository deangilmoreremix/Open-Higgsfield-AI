import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';

const WorkflowContext = createContext(null);

const initialState = {
  workflows: [],
  currentWorkflow: null,
  nodes: [],
  edges: [],
  isRunning: false,
  runStatus: null,
  result: null,
  error: null,
  nodeSchemas: null,
  templates: [],
  apiKey: localStorage.getItem('muapi_key') || '',
  isDemoMode: true,
};

function workflowReducer(state, action) {
  switch (action.type) {
    case 'SET_WORKFLOWS':
      return { ...state, workflows: action.payload };
    case 'SET_CURRENT_WORKFLOW':
      return { ...state, currentWorkflow: action.payload };
    case 'SET_NODES':
      return { ...state, nodes: action.payload };
    case 'SET_EDGES':
      return { ...state, edges: action.payload };
    case 'ADD_NODE':
      return { ...state, nodes: [...state.nodes, action.payload] };
    case 'UPDATE_NODE':
      return {
        ...state,
        nodes: state.nodes.map(n =>
          n.id === action.payload.id ? { ...n, ...action.payload } : n
        ),
      };
    case 'DELETE_NODE':
      return {
        ...state,
        nodes: state.nodes.filter(n => n.id !== action.payload),
        edges: state.edges.filter(e => e.source !== action.payload && e.target !== action.payload),
      };
    case 'SET_RUNNING':
      return { ...state, isRunning: action.payload };
    case 'SET_RUN_STATUS':
      return { ...state, runStatus: action.payload };
    case 'SET_RESULT':
      return { ...state, result: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_NODE_SCHEMAS':
      return { ...state, nodeSchemas: action.payload };
    case 'SET_TEMPLATES':
      return { ...state, templates: action.payload };
    case 'SET_API_KEY':
      localStorage.setItem('muapi_key', action.payload);
      return { ...state, apiKey: action.payload, isDemoMode: !action.payload };
    case 'LOAD_STATE':
      return { ...state, ...action.payload };
    case 'RESET':
      return {
        ...initialState,
        apiKey: state.apiKey,
        isDemoMode: state.isDemoMode,
        nodeSchemas: state.nodeSchemas,
        templates: state.templates,
      };
    default:
      return state;
  }
}

export function WorkflowProvider({ children }) {
  const [state, dispatch] = useReducer(workflowReducer, initialState);

  const setWorkflows = useCallback((workflows) => {
    dispatch({ type: 'SET_WORKFLOWS', payload: workflows });
  }, []);

  const setCurrentWorkflow = useCallback((workflow) => {
    dispatch({ type: 'SET_CURRENT_WORKFLOW', payload: workflow });
  }, []);

  const setNodes = useCallback((nodes) => {
    dispatch({ type: 'SET_NODES', payload: nodes });
  }, []);

  const setEdges = useCallback((edges) => {
    dispatch({ type: 'SET_EDGES', payload: edges });
  }, []);

  const addNode = useCallback((node) => {
    dispatch({ type: 'ADD_NODE', payload: node });
  }, []);

  const updateNode = useCallback((nodeData) => {
    dispatch({ type: 'UPDATE_NODE', payload: nodeData });
  }, []);

  const deleteNode = useCallback((nodeId) => {
    dispatch({ type: 'DELETE_NODE', payload: nodeId });
  }, []);

  const setRunning = useCallback((isRunning) => {
    dispatch({ type: 'SET_RUNNING', payload: isRunning });
  }, []);

  const setRunStatus = useCallback((status) => {
    dispatch({ type: 'SET_RUN_STATUS', payload: status });
  }, []);

  const setResult = useCallback((result) => {
    dispatch({ type: 'SET_RESULT', payload: result });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setNodeSchemas = useCallback((schemas) => {
    dispatch({ type: 'SET_NODE_SCHEMAS', payload: schemas });
  }, []);

  const setTemplates = useCallback((templates) => {
    dispatch({ type: 'SET_TEMPLATES', payload: templates });
  }, []);

  const setApiKey = useCallback((key) => {
    dispatch({ type: 'SET_API_KEY', payload: key });
  }, []);

  const loadState = useCallback((newState) => {
    dispatch({ type: 'LOAD_STATE', payload: newState });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  useEffect(() => {
    const savedWorkflows = localStorage.getItem('workflows');
    if (savedWorkflows) {
      setWorkflows(JSON.parse(savedWorkflows));
    }
    const savedTemplates = localStorage.getItem('workflow_templates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('workflows', JSON.stringify(state.workflows));
  }, [state.workflows]);

  const value = {
    ...state,
    setWorkflows,
    setCurrentWorkflow,
    setNodes,
    setEdges,
    addNode,
    updateNode,
    deleteNode,
    setRunning,
    setRunStatus,
    setResult,
    setError,
    setNodeSchemas,
    setTemplates,
    setApiKey,
    loadState,
    reset,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
}

export default WorkflowContext;