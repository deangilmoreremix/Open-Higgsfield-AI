import { muapiAdapter } from '../adapters/muapiAdapter';
import { openaiAdapter } from '../adapters/openaiAdapter';

const RUNS_KEY = 'workflow_runs';

export async function runWorkflow(workflow, inputs = {}) {
  try {
    const nodes = workflow.data?.nodes || [];
    const runId = `run_${Date.now()}`;
    const runResults = {};

    for (const node of nodes) {
      const nodeInputs = collectNodeInputs(node, nodes, inputs, runResults);
      const result = await executeNode(node, nodeInputs);
      runResults[node.id] = result;
    }

    const run = {
      id: runId,
      workflowId: workflow.id,
      status: 'completed',
      results: runResults,
      createdAt: new Date().toISOString(),
    };

    saveRun(run);
    return run;
  } catch (error) {
    console.error('Error running workflow:', error);
    throw error;
  }
}

export async function runNode(workflowId, nodeId, params) {
  try {
    const runId = `run_${Date.now()}_${nodeId}`;
    const result = await executeNode({ id: nodeId, ...params }, params);
    return {
      id: runId,
      nodeId,
      status: 'completed',
      result,
    };
  } catch (error) {
    console.error('Error running node:', error);
    throw error;
  }
}

export async function getWorkflowRunStatus(runId) {
  try {
    const runs = JSON.parse(localStorage.getItem(RUNS_KEY) || '[]');
    return runs.find(r => r.id === runId) || null;
  } catch (error) {
    console.error('Error getting run status:', error);
    return null;
  }
}

export async function cancelWorkflowRun(runId) {
  try {
    const runs = JSON.parse(localStorage.getItem(RUNS_KEY) || '[]');
    const run = runs.find(r => r.id === runId);
    if (run) {
      run.status = 'cancelled';
      run.completedAt = new Date().toISOString();
      localStorage.setItem(RUNS_KEY, JSON.stringify(runs));
    }
    return true;
  } catch (error) {
    console.error('Error cancelling run:', error);
    throw error;
  }
}

export async function saveWorkflowRun(run) {
  try {
    const runs = JSON.parse(localStorage.getItem(RUNS_KEY) || '[]');
    const existingIndex = runs.findIndex(r => r.id === run.id);
    if (existingIndex >= 0) {
      runs[existingIndex] = run;
    } else {
      runs.unshift(run);
    }
    localStorage.setItem(RUNS_KEY, JSON.stringify(runs));
    return run;
  } catch (error) {
    console.error('Error saving run:', error);
    throw error;
  }
}

export async function getWorkflowOutput(runId) {
  try {
    const run = await getWorkflowRunStatus(runId);
    if (!run) return null;
    return run.results;
  } catch (error) {
    console.error('Error getting workflow output:', error);
    return null;
  }
}

export async function retryFailedNode(runId, nodeId) {
  try {
    const run = await getWorkflowRunStatus(runId);
    if (!run) {
      throw new Error('Run not found');
    }
    const failedResult = run.results?.[nodeId];
    if (!failedResult || failedResult.status !== 'failed') {
      throw new Error('Node did not fail');
    }
    const newRunId = `run_${Date.now()}`;
    const result = await executeNode({ id: nodeId, ...failedResult.params }, failedResult.params);
    run.results[nodeId] = result;
    run.id = newRunId;
    saveRun(run);
    return result;
  } catch (error) {
    console.error('Error retrying node:', error);
    throw error;
  }
}

function collectNodeInputs(node, allNodes, userInputs, previousResults) {
  const inputs = {};
  const nodeType = node.type;

  switch (nodeType) {
    case 'textNode':
      inputs.prompt = userInputs.prompt || node.data?.formValues?.prompt || '';
      inputs.system_prompt = node.data?.formValues?.system_prompt || '';
      inputs.images_list = node.data?.formValues?.images_list || [];
      inputs.image_url = node.data?.formValues?.image_url || '';
      break;
    case 'imageNode':
      inputs.prompt = userInputs.prompt || node.data?.formValues?.prompt || '';
      inputs.aspect_ratio = node.data?.formValues?.aspect_ratio || '1:1';
      inputs.quality = node.data?.formValues?.quality || 'high';
      inputs.size = node.data?.formValues?.size || '1024x1024';
      inputs.images_list = node.data?.formValues?.images_list || [];
      inputs.image_url = node.data?.formValues?.image_url || '';
      break;
    case 'videoNode':
      inputs.prompt = userInputs.prompt || node.data?.formValues?.prompt || '';
      inputs.aspect_ratio = node.data?.formValues?.aspect_ratio || '16:9';
      inputs.duration = node.data?.formValues?.duration || 5;
      inputs.quality = node.data?.formValues?.quality || 'high';
      inputs.image_url = node.data?.formValues?.image_url || '';
      inputs.last_image = node.data?.formValues?.last_image || '';
      inputs.video_url = node.data?.formValues?.video_url || '';
      inputs.audio_url = node.data?.formValues?.audio_url || '';
      inputs.images_list = node.data?.formValues?.images_list || [];
      inputs.videos_list = node.data?.formValues?.videos_list || [];
      inputs.audios_list = node.data?.formValues?.audios_list || [];
      break;
    case 'audioNode':
      inputs.prompt = userInputs.prompt || node.data?.formValues?.prompt || '';
      inputs.audio_url = node.data?.formValues?.audio_url || '';
      break;
    case 'concatNode':
      inputs.prompt = node.data?.formValues?.prompt || '';
      break;
    case 'vidConcatNode':
      inputs.videos_list = node.data?.formValues?.videos_list || [];
      inputs.aspect_ratio = node.data?.formValues?.aspect_ratio || '16:9';
      break;
    default:
      break;
  }

  return inputs;
}

async function executeNode(node, inputs) {
  const nodeType = node.type;
  const modelId = node.data?.selectedModel?.id || getDefaultModel(nodeType);

  try {
    switch (nodeType) {
      case 'textNode':
        return await openaiAdapter.generateText({
          model: modelId,
          prompt: inputs.prompt,
          system_prompt: inputs.system_prompt,
        });
      case 'imageNode':
        return await muapiAdapter.generateImage({
          model: modelId,
          prompt: inputs.prompt,
          aspect_ratio: inputs.aspect_ratio,
          quality: inputs.quality,
          size: inputs.size,
          image_url: inputs.image_url,
          images_list: inputs.images_list,
        });
      case 'videoNode':
        return await muapiAdapter.generateVideo({
          model: modelId,
          prompt: inputs.prompt,
          aspect_ratio: inputs.aspect_ratio,
          duration: inputs.duration,
          quality: inputs.quality,
          image_url: inputs.image_url,
          last_image: inputs.last_image,
          video_url: inputs.video_url,
          audio_url: inputs.audio_url,
          images_list: inputs.images_list,
        });
      case 'audioNode':
        return await muapiAdapter.generateAudio({
          model: modelId,
          prompt: inputs.prompt,
          audio_url: inputs.audio_url,
        });
      case 'concatNode':
        return {
          status: 'completed',
          outputs: [{ type: 'text', value: inputs.prompt }],
          resultUrl: inputs.prompt,
        };
      case 'vidConcatNode':
        return {
          status: 'completed',
          outputs: [{ type: 'video_url', value: inputs.videos_list?.[0] || null }],
          resultUrl: inputs.videos_list?.[0] || null,
        };
      default:
        return {
          status: 'completed',
          outputs: [],
          resultUrl: null,
        };
    }
  } catch (error) {
    return {
      status: 'failed',
      error: error.message,
      outputs: [],
      resultUrl: null,
    };
  }
}

function getDefaultModel(nodeType) {
  switch (nodeType) {
    case 'textNode': return 'gpt-4o';
    case 'imageNode': return 'flux-dev';
    case 'videoNode': return 'wan-2-1';
    case 'audioNode': return 'music-gen';
    default: return null;
  }
}

function saveRun(run) {
  const runs = JSON.parse(localStorage.getItem(RUNS_KEY) || '[]');
  runs.unshift(run);
  if (runs.length > 50) {
    runs.pop();
  }
  localStorage.setItem(RUNS_KEY, JSON.stringify(runs));
}

export function pollForResult(requestId, intervalMs = 3000, maxAttempts = 60) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const result = await muapiAdapter.checkStatus(requestId);
        if (result.status === 'completed') {
          clearInterval(interval);
          resolve(result);
        } else if (result.status === 'failed') {
          clearInterval(interval);
          reject(new Error(result.error || 'Generation failed'));
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          reject(new Error('Polling timeout'));
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, intervalMs);
  });
}