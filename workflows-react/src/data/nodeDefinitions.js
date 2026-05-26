export const NODE_TYPES = {
  TEXT: 'textNode',
  IMAGE: 'imageNode',
  VIDEO: 'videoNode',
  AUDIO: 'audioNode',
  API: 'apiNode',
  CONCAT: 'concatNode',
  VID_CONCAT: 'vidConcatNode',
};

export const NODE_CATEGORIES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  API: 'api',
  UTILITY: 'utility',
};

export const HANDLE_COLORS = {
  BLUE: 'blue',
  GREEN: 'green',
  ORANGE: 'orange',
  YELLOW: 'yellow',
};

export const TEXT_MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', category: 'text' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', category: 'text' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', category: 'text' },
  { id: 'text-passthrough', name: 'Input Text', category: 'text' },
];

export const IMAGE_MODELS = [
  { id: 'flux-dev', name: 'FLUX Dev', category: 'image' },
  { id: 'flux-2-max', name: 'FLUX 2 Max', category: 'image' },
  { id: 'sd3-medium', name: 'SD3 Medium', category: 'image' },
  { id: 'wan-2-7-t2i', name: 'Wan 2.7 T2I', category: 'image' },
  { id: 'image-passthrough', name: 'Input Image', category: 'image' },
];

export const VIDEO_MODELS = [
  { id: 'wan-2-1', name: 'Wan 2.1', category: 'video' },
  { id: 'kling-3-0', name: 'Kling 3.0', category: 'video' },
  { id: 'veo-3-1', name: 'Veo 3.1', category: 'video' },
  { id: 'runway-gen-4', name: 'Runway Gen-4', category: 'video' },
  { id: 'video-passthrough', name: 'Input Video', category: 'video' },
];

export const AUDIO_MODELS = [
  { id: 'music-gen', name: 'Music Generation', category: 'audio' },
  { id: 'audio-passthrough', name: 'Input Audio', category: 'audio' },
];

export const UTILITY_MODELS = [
  { id: 'prompt-concatenator', name: 'Prompt Concat', category: 'utility' },
  { id: 'video-combiner', name: 'Video Combiner', category: 'utility' },
];

export const EDGE_STYLES = {
  blue: {
    stroke: '#3b82f6',
    strokeWidth: 2,
  },
  green: {
    stroke: '#22c55e',
    strokeWidth: 2,
  },
  orange: {
    stroke: '#f97316',
    strokeWidth: 2,
  },
  yellow: {
    stroke: '#eab308',
    strokeWidth: 2,
  },
  white: {
    stroke: '#ffffff',
    strokeWidth: 2,
  },
};

export const getEdgeColor = (sourceHandle, targetHandle, sourceNode = null) => {
  if (sourceHandle === 'apiOutput' && sourceNode) {
    const output = sourceNode.data?.outputs?.[0];
    const modelType = sourceNode.data?.formValues?.model_type;
    if (output?.type === 'text' || modelType === 'chat') return 'blue';
    if (output?.type === 'video_url' || modelType === 'video') return 'orange';
    if (output?.type === 'audio_url' || modelType === 'audio') return 'yellow';
    return 'green';
  }

  if (['textOutput', 'concatOutput'].includes(sourceHandle)) return 'blue';
  if (['imageOutput'].includes(sourceHandle)) return 'green';
  if (['videoOutput'].includes(sourceHandle)) return 'orange';
  if (['audioOutput'].includes(sourceHandle)) return 'yellow';

  if (['textInput', 'textInput4', 'imageInput', 'videoInput', 'audioInput2', 'concatInput', 'apiInput'].includes(targetHandle)) return 'blue';
  if (['textInput2', 'textInput3', 'imageInput2', 'imageInput3', 'videoInput2', 'videoInput3', 'videoInput6', 'audioInput3', 'apiInput2', 'apiInput3'].includes(targetHandle)) return 'green';
  if (['videoInput4', 'audioInput4', 'videoInput7'].includes(targetHandle)) return 'orange';
  if (['audioInput', 'videoInput5', 'videoInput8'].includes(targetHandle)) return 'yellow';

  if (sourceNode) {
    const type = sourceNode.type;
    if (type === NODE_TYPES.TEXT || type === NODE_TYPES.CONCAT) return 'blue';
    if (type === NODE_TYPES.IMAGE) return 'green';
    if (type === NODE_TYPES.VIDEO || type === NODE_TYPES.VID_CONCAT) return 'orange';
    if (type === NODE_TYPES.AUDIO) return 'yellow';
  }

  return 'white';
};

export const createNode = (type, position = { x: 100, y: 100 }) => {
  const id = `${type.replace('Node', '').toLowerCase()}_${Date.now()}`;
  return {
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
    },
  };
};

export const createEdge = (source, target, sourceHandle, targetHandle, sourceNode, targetNode) => {
  const edgeColor = getEdgeColor(sourceHandle, targetHandle, sourceNode, targetNode);
  return {
    id: `e-${source}-${target}-${Date.now()}`,
    source,
    target,
    sourceHandle,
    targetHandle,
    style: EDGE_STYLES[edgeColor],
  };
};

export const PRESET_WORKFLOWS = [
  {
    id: 'preset-1',
    name: 'Image Generation Pipeline',
    description: 'Generate images from text prompts',
    category: 'image',
    nodes: [
      { id: 'text1', type: NODE_TYPES.TEXT, position: { x: 0, y: 100 }, data: { label: 'Prompt' } },
      { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 300, y: 100 }, data: { label: 'Image Gen' } },
    ],
    edges: [
      { source: 'text1', target: 'image1', sourceHandle: 'textOutput', targetHandle: 'imageInput' },
    ],
  },
  {
    id: 'preset-2',
    name: 'Video Generation Pipeline',
    description: 'Generate videos from images and prompts',
    category: 'video',
    nodes: [
      { id: 'image1', type: NODE_TYPES.IMAGE, position: { x: 0, y: 100 }, data: { label: 'Start Frame' } },
      { id: 'text1', type: NODE_TYPES.TEXT, position: { x: 0, y: 200 }, data: { label: 'Prompt' } },
      { id: 'video1', type: NODE_TYPES.VIDEO, position: { x: 300, y: 100 }, data: { label: 'Video Gen' } },
    ],
    edges: [
      { source: 'image1', target: 'video1', sourceHandle: 'imageOutput', targetHandle: 'videoInput2' },
      { source: 'text1', target: 'video1', sourceHandle: 'textOutput', targetHandle: 'videoInput' },
    ],
  },
];

export const DEFAULT_WORKFLOW = {
  id: null,
  name: 'Untitled Workflow',
  edges: [],
  data: { nodes: [] },
  category: 'General',
};

export const SCHEMA_DEFAULTS = {
  text: {
    prompt: { type: 'string', default: '' },
    system_prompt: { type: 'string', default: '' },
    images_list: { type: 'array', default: [] },
    image_url: { type: 'string', default: '' },
  },
  image: {
    prompt: { type: 'string', default: '' },
    aspect_ratio: { type: 'string', default: '1:1' },
    quality: { type: 'string', default: 'high' },
    size: { type: 'string', default: '1024x1024' },
    images_list: { type: 'array', default: [] },
    image_url: { type: 'string', default: '' },
  },
  video: {
    prompt: { type: 'string', default: '' },
    aspect_ratio: { type: 'string', default: '16:9' },
    duration: { type: 'int', default: 5 },
    quality: { type: 'string', default: 'high' },
    image_url: { type: 'string', default: '' },
    last_image: { type: 'string', default: '' },
    video_url: { type: 'string', default: '' },
    audio_url: { type: 'string', default: '' },
    images_list: { type: 'array', default: [] },
    videos_list: { type: 'array', default: [] },
    audios_list: { type: 'array', default: [] },
  },
  audio: {
    prompt: { type: 'string', default: '' },
    audio_url: { type: 'string', default: '' },
  },
};

export function initializeFormData(schemaProperties) {
  const initialData = {};
  const fieldEntries = Object.entries(schemaProperties || {});

  fieldEntries.forEach(([fieldName, fieldSchema]) => {
    if (fieldSchema.type === 'array') {
      if (fieldSchema.items?.type === 'object') {
        const examples = fieldSchema.examples;
        if (Array.isArray(examples) && examples.length > 0) {
          initialData[fieldName] = examples.map((ex) => ({ ...ex }));
        } else {
          initialData[fieldName] = [];
        }
      } else {
        initialData[fieldName] = fieldSchema.examples || [];
      }
    } else if (fieldSchema.type === 'object') {
      const nestedProps = fieldSchema.properties || {};
      initialData[fieldName] = initializeFormData(nestedProps);
    } else if (fieldSchema.default !== undefined) {
      initialData[fieldName] = fieldSchema.default;
    } else if (fieldSchema.examples && fieldSchema.examples.length > 0) {
      initialData[fieldName] = fieldSchema.examples[0];
    } else {
      switch (fieldSchema.type) {
        case 'boolean':
          initialData[fieldName] = false;
          break;
        case 'int':
        case 'number':
          initialData[fieldName] = 0;
          break;
        default:
          initialData[fieldName] = '';
      }
    }
  });

  return initialData;
}