import { supabase } from '../../../lib/supabase-client.ts';
import { generateImage, generateVideo, getUserWorkflows, createWorkflow, executeWorkflow } from '../../../lib/muapi.js';

const STORAGE_KEY = 'higgsfield.vibe-workflow.workflows';

function safeReadStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch { return fallback; }
}
function safeWriteStorage(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }

export const NODE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  CONCAT: 'concat',
  VIDEO_CONCAT: 'video-concat',
  API: 'api'
};

export const NODE_CATEGORIES = {
  text: {
    name: 'Text Generation',
    color: '#3b82f6',
    models: [
      { id: 'text-passthrough', name: 'Input Text', type: 'input' },
      { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai' },
      { id: 'claude-3', name: 'Claude 3', provider: 'anthropic' },
      { id: 'llama-3', name: 'Llama 3', provider: 'meta' }
    ]
  },
  image: {
    name: 'Image Generation',
    color: '#22c55e',
    models: [
      { id: 'image-passthrough', name: 'Input Image', type: 'input' },
      { id: 'dalle-3', name: 'DALL-E 3', provider: 'openai' },
      { id: 'stable-diffusion', name: 'Stable Diffusion', provider: 'stabilityai' },
      { id: 'midjourney', name: 'Midjourney', provider: 'midjourney' }
    ]
  },
  video: {
    name: 'Video Generation',
    color: '#f97316',
    models: [
      { id: 'video-passthrough', name: 'Input Video', type: 'input' },
      { id: 'sora', name: 'Sora', provider: 'openai' },
      { id: 'runway', name: 'Runway', provider: 'runwayml' },
      { id: 'kling', name: 'Kling', provider: 'kling' }
    ]
  },
  audio: {
    name: 'Audio Generation',
    color: '#eab308',
    models: [
      { id: 'audio-passthrough', name: 'Input Audio', type: 'input' },
      { id: 'elevenlabs', name: 'ElevenLabs', provider: 'elevenlabs' },
      { id: 'bark', name: 'Bark', provider: 'suno' }
    ]
  },
  utility: {
    name: 'Utility',
    color: '#6b7280',
    models: [
      { id: 'prompt-concatenator', name: 'Prompt Concatenator' },
      { id: 'video-combiner', name: 'Video Combiner' }
    ]
  },
  api: {
    name: 'API Integration',
    color: '#8b5cf6',
    models: []
  }
};

export const WORKFLOW_TEMPLATES = [
  {
    id: 'image-pipeline',
    name: 'Image Generation Pipeline',
    description: 'Generate images from text prompts with multiple style variations',
    nodes: [
      { id: 'text1', type: 'textNode', position: { x: 0, y: 100 }, data: { modelId: 'text-passthrough' } },
      { id: 'image1', type: 'imageNode', position: { x: 300, y: 100 }, data: { modelId: 'dalle-3' } }
    ],
    edges: [
      { source: 'text1', target: 'image1', sourceHandle: 'textOutput', targetHandle: 'textInput' }
    ]
  },
  {
    id: 'video-creation',
    name: 'Video Creation Flow',
    description: 'Create videos from text or images with cinematic effects',
    nodes: [
      { id: 'text1', type: 'textNode', position: { x: 0, y: 100 }, data: { modelId: 'text-passthrough' } },
      { id: 'image1', type: 'imageNode', position: { x: 300, y: 100 }, data: { modelId: 'dalle-3' } },
      { id: 'video1', type: 'videoNode', position: { x: 600, y: 100 }, data: { modelId: 'sora' } }
    ],
    edges: [
      { source: 'text1', target: 'image1', sourceHandle: 'textOutput', targetHandle: 'textInput' },
      { source: 'image1', target: 'video1', sourceHandle: 'imageOutput', targetHandle: 'imageInput' }
    ]
  },
  {
    id: 'brand-campaign',
    name: 'Brand Campaign',
    description: 'Multi-step campaign generation with consistent branding',
    nodes: [
      { id: 'text1', type: 'textNode', position: { x: 0, y: 100 }, data: { modelId: 'text-passthrough' } },
      { id: 'concat1', type: 'concatNode', position: { x: 300, y: 100 }, data: { modelId: 'prompt-concatenator' } },
      { id: 'image1', type: 'imageNode', position: { x: 600, y: 100 }, data: { modelId: 'dalle-3' } },
      { id: 'image2', type: 'imageNode', position: { x: 600, y: 250 }, data: { modelId: 'stable-diffusion' } }
    ],
    edges: [
      { source: 'text1', target: 'concat1', sourceHandle: 'textOutput', targetHandle: 'concatInput' }
    ]
  }
];

export async function listWorkflows() {
  try {
    const { data, error } = await supabase.from('muapi_workflows').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('VibeWorkflow listWorkflows error:', err);
    return safeReadStorage(STORAGE_KEY, []);
  }
}

export async function getWorkflow(id) {
  try {
    const { data, error } = await supabase.from('muapi_workflows').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  } catch (err) { return null; }
}

export async function createWorkflowLocal(workflow) {
  try {
    const { data, error } = await supabase.from('muapi_workflows').insert(workflow).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('VibeWorkflow createWorkflow error:', err);
    const id = 'wf_' + Date.now();
    const newWorkflow = { id, ...workflow, created_at: new Date().toISOString() };
    safeWriteStorage(STORAGE_KEY, [...safeReadStorage(STORAGE_KEY, []), newWorkflow]);
    return newWorkflow;
  }
}

export async function updateWorkflow(id, updates) {
  try {
    const { data, error } = await supabase.from('muapi_workflows').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  } catch (err) { throw err; }
}

export async function deleteWorkflow(id) {
  try {
    await supabase.from('muapi_workflows').delete().eq('id', id);
  } catch (err) { console.error('VibeWorkflow deleteWorkflow error:', err); }
}

export async function duplicateWorkflow(id) {
  const original = await getWorkflow(id);
  if (!original) throw new Error('Workflow not found');
  const { id: _, created_at, ...rest } = original;
  return createWorkflowLocal({ ...rest, name: `${original.name} (Copy)` });
}

export async function listWorkflowTemplates() {
  try {
    const apiKey = import.meta.env.VITE_MUAPI_KEY;
    const templates = await getUserWorkflows(apiKey);
    return templates || [];
  } catch (err) {
    return [
      { id: 'template-1', name: 'Image Generation Pipeline', description: 'Generate images from text prompts' },
      { id: 'template-2', name: 'Video Creation Flow', description: 'Create videos from text or images' },
      { id: 'template-3', name: 'Brand Campaign', description: 'Multi-step campaign generation' }
    ];
  }
}

export async function createWorkflowFromTemplate(templateId) {
  const templates = await listWorkflowTemplates();
  const template = templates.find(t => t.id === templateId);
  if (!template) throw new Error('Template not found');
  return createWorkflowLocal({
    name: template.name,
    description: template.description,
    nodes: [],
    template: templateId
  });
}

export async function runWorkflow(workflow, params = {}) {
  try {
    const apiKey = import.meta.env.VITE_MUAPI_KEY;
    const result = await executeWorkflow(apiKey, workflow.id, params);
    return result;
  } catch (err) {
    console.error('VibeWorkflow runWorkflow error:', err);
    return { status: 'error', error: err.message };
  }
}

export async function runWorkflowNode(node, input) {
  try {
    const apiKey = import.meta.env.VITE_MUAPI_KEY;
    const label = node.label || node.type || '';
    const prompt = input.prompt || 'creative prompt';
    
    if (label.toLowerCase().includes('image') || node.type === 'image') {
      return generateImage(apiKey, { prompt, ...input });
    }
    if (label.toLowerCase().includes('video') || node.type === 'video') {
      return generateVideo(apiKey, { prompt, duration: 5, ...input });
    }
    
    return { status: 'skipped', reason: 'Unknown node type' };
  } catch (err) {
    return { status: 'error', error: err.message };
  }
}

export async function saveWorkflowRun(workflowId, run) {
  try {
    const { data, error } = await supabase.from('generation_jobs').insert({
      job_type: 'vibe-workflow-run',
      input: { workflowId, ...run },
      status: 'completed'
    }).select().single();
    if (error) throw error;
    return data;
  } catch (err) { return null; }
}

export async function saveWorkflowOutput(workflowId, output) {
  return saveWorkflowRun(workflowId, { output, timestamp: new Date().toISOString() });
}

export async function saveOutputToLibrary(output) {
  try {
    const { data, error } = await supabase.from('generation_jobs').insert({
      job_type: 'vibe-workflow-output',
      output_url: output.url,
      input: { prompt: output.prompt },
      status: 'completed'
    }).select().single();
    if (error) throw error;
    return data;
  } catch (err) { throw err; }
}

export function handoffWorkflowOutput(target, output) {
  const HANDOFF_KEYS = {
    library: 'higgsfield.pendingLibraryOutput',
    render: 'higgsfield.pendingRenderOutput',
    director: 'higgsfield.pendingDirectorOutput',
    timeline: 'higgsfield.pendingTimelineOutput',
    'edit-studio': 'higgsfield.pendingEditStudioOutput',
    'video-agent': 'higgsfield.pendingVideoAgentOutput'
  };
  if (HANDOFF_KEYS[target]) {
    sessionStorage.setItem(HANDOFF_KEYS[target], JSON.stringify({ content: output, app: 'vibe-workflow' }));
  }
}

export function buildWorkflowGraph(nodes, edges) {
  const nodeMap = {};
  nodes.forEach(node => {
    nodeMap[node.id] = {
      ...node,
      inputs: [],
      outputs: []
    };
  });

  edges.forEach(edge => {
    if (nodeMap[edge.source]) {
      nodeMap[edge.source].outputs.push(edge);
    }
    if (nodeMap[edge.target]) {
      nodeMap[edge.target].inputs.push(edge);
    }
  });

  return nodeMap;
}

export function getExecutionOrder(graph) {
  const visited = new Set();
  const order = [];

  function visit(nodeId) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = graph[nodeId];
    if (!node) return;

    node.inputs.forEach(input => {
      visit(input.source);
    });

    order.push(nodeId);
  }

  Object.keys(graph).forEach(nodeId => visit(nodeId));
  return order;
}

export async function executeNode(node, inputData, context = {}) {
  const modelId = node.data?.modelId || node.modelId;
  const category = node.type?.replace('Node', '').toLowerCase() || 'text';
  const apiKey = import.meta.env.VITE_MUAPI_KEY;

  try {
    if (category === 'text') {
      if (modelId === 'text-passthrough') {
        return { type: 'text', value: inputData.prompt || '' };
      }
      return { type: 'text', value: `Text generation with ${modelId}` };
    }

    if (category === 'image') {
      if (modelId === 'image-passthrough') {
        return { type: 'image_url', value: inputData.image_url || inputData.images_list?.[0] || '' };
      }
      const result = await generateImage(apiKey, {
        prompt: inputData.prompt,
        ...inputData
      });
      return { type: 'image_url', value: result.url || result.image_url || '' };
    }

    if (category === 'video') {
      if (modelId === 'video-passthrough') {
        return { type: 'video_url', value: inputData.video_url || '' };
      }
      const result = await generateVideo(apiKey, {
        prompt: inputData.prompt,
        duration: inputData.duration || 5,
        ...inputData
      });
      return { type: 'video_url', value: result.url || result.video_url || '' };
    }

    if (category === 'concat') {
      const concatValues = node.inputs.map(input => {
        const sourceNode = graph[input.source];
        return sourceNode?.data?.resultUrl || '';
      }).filter(v => v);
      return { type: 'text', value: concatValues.join(' ') };
    }

    return { type: 'unknown', value: null };
  } catch (err) {
    console.error('executeNode error:', err);
    return { type: 'error', error: err.message };
  }
}

export async function executeWorkflowGraph(workflow, context = {}) {
  const graph = buildWorkflowGraph(workflow.nodes, workflow.edges);
  const order = getExecutionOrder(graph);
  const results = {};

  for (const nodeId of order) {
    const node = graph[nodeId];
    const inputData = {};

    node.inputs.forEach(input => {
      const sourceResult = results[input.source];
      if (sourceResult) {
        inputData[input.targetHandle] = sourceResult.value;
      }
    });

    const result = await executeNode(node, inputData, context);
    results[nodeId] = result;

    graph[nodeId].data = {
      ...graph[nodeId].data,
      resultUrl: result.value,
      outputs: [result]
    };
  }

  return {
    results,
    graph,
    order
  };
}

export function validateWorkflow(workflow) {
  const errors = [];
  const nodeIds = new Set(workflow.nodes.map(n => n.id));

  workflow.edges.forEach(edge => {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge references non-existent source node: ${edge.source}`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge references non-existent target node: ${edge.target}`);
    }
  });

  const inputNodes = workflow.nodes.filter(n => {
    const type = n.type?.replace('Node', '').toLowerCase();
    return type === 'text' && (n.data?.modelId === 'text-passthrough' || n.data?.modelId === 'image-passthrough');
  });

  if (inputNodes.length === 0) {
    errors.push('Workflow must have at least one input node');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function serializeWorkflow(workflow) {
  return {
    id: workflow.id,
    name: workflow.name,
    nodes: workflow.nodes.map(n => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: {
        modelId: n.data?.modelId,
        formValues: n.data?.formValues || {},
        outputs: n.data?.outputs || []
      }
    })),
    edges: workflow.edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle
    }))
  };
}

export function deserializeWorkflow(data) {
  return {
    id: data.id,
    name: data.name,
    nodes: data.nodes.map(n => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: {
        modelId: n.data?.modelId,
        formValues: n.data?.formValues || {},
        outputs: n.data?.outputs || [],
        resultUrl: n.data?.resultUrl
      }
    })),
    edges: data.edges
  };
}