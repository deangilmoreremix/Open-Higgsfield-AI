import { getModelById, getVideoModelById, getI2IModelById, getI2VModelById, getV2VModelById, getLipSyncModelById } from './models.js';

// In an http(s) browser we route through the host app's proxy (Next.js routes
// under /api/* re-issue the call server-side) so api.muapi.ai CORS is bypassed.
// SSR (no window) and Electron's file:// renderer call the upstream directly.
const BASE_URL = (typeof window !== 'undefined' && window.location?.protocol?.startsWith('http'))
    ? '/api'
    : 'https://api.muapi.ai';
const PROXY_WF_BASE = '/api/workflow';

async function pollForResult(requestId, key, maxAttempts = 900, interval = 2000) {
    const pollUrl = `${BASE_URL}/api/v1/predictions/${requestId}/result`;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        await new Promise(resolve => setTimeout(resolve, interval));
        try {
            const response = await fetch(pollUrl, {
                headers: { 'Content-Type': 'application/json', 'x-api-key': key }
            });
            if (!response.ok) {
                const errText = await response.text();
                if (response.status >= 500) continue;
                throw new Error(`Poll Failed: ${response.status} - ${errText.slice(0, 100)}`);
            }
            const data = await response.json();
            const status = data.status?.toLowerCase();
            if (status === 'completed' || status === 'succeeded' || status === 'success') return data;
            if (status === 'failed' || status === 'error') throw new Error(`Generation failed: ${data.error || 'Unknown error'}`);
        } catch (error) {
            if (attempt === maxAttempts) throw error;
        }
    }
    throw new Error('Generation timed out after polling.');
}

async function submitAndPoll(endpoint, payload, key, onRequestId, maxAttempts = 60) {
    const url = `${BASE_URL}/api/v1/${endpoint}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': key },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Request Failed: ${response.status} ${response.statusText} - ${errText.slice(0, 100)}`);
    }
    const submitData = await response.json();
    const requestId = submitData.request_id || submitData.id;
    if (!requestId) return submitData;
    if (onRequestId) onRequestId(requestId);
    const result = await pollForResult(requestId, key, maxAttempts);
    const outputUrl = result.outputs?.[0] || result.url || result.output?.url;
    return { ...result, url: outputUrl };
}

export async function generateImage(apiKey, params) {
    const modelInfo = getModelById(params.model);
    const endpoint = modelInfo?.endpoint || params.model;
    const payload = { prompt: params.prompt };
    if (params.aspect_ratio) payload.aspect_ratio = params.aspect_ratio;
    if (params.resolution) payload.resolution = params.resolution;
    if (params.quality) payload.quality = params.quality;
    if (params.image_url) { 
        payload.image_url = params.image_url; 
        payload.strength = params.strength || 0.6; 
    } else if (params.images_list) {
        payload.images_list = params.images_list;
    } else {
        payload.image_url = null;
    }
    if (params.seed && params.seed !== -1) payload.seed = params.seed;
    return submitAndPoll(endpoint, payload, apiKey, params.onRequestId, 60);
}

export async function generateI2I(apiKey, params) {
    const modelInfo = getI2IModelById(params.model);
    const endpoint = modelInfo?.endpoint || params.model;
    const payload = {};
    if (params.prompt) payload.prompt = params.prompt;
    const imageField = modelInfo?.imageField || 'image_url';
    const imagesList = params.images_list?.length > 0 ? params.images_list : (params.image_url ? [params.image_url] : null);
    if (imagesList) {
        if (imageField === 'images_list') payload.images_list = imagesList;
        else payload[imageField] = imagesList[0];
    }
    if (params.aspect_ratio) payload.aspect_ratio = params.aspect_ratio;
    if (params.resolution) payload.resolution = params.resolution;
    if (params.quality) payload.quality = params.quality;
    if (modelInfo?.inputs?.name) {
        payload.name = params.name || modelInfo.inputs.name.default;
    }
    return submitAndPoll(endpoint, payload, apiKey, params.onRequestId, 60);
}

export async function generateVideo(apiKey, params) {
    const modelInfo = getVideoModelById(params.model);
    const endpoint = modelInfo?.endpoint || params.model;
    const payload = {};
    if (params.prompt) payload.prompt = params.prompt;
    if (params.aspect_ratio) payload.aspect_ratio = params.aspect_ratio;
    if (params.duration) payload.duration = params.duration;
    if (params.resolution) payload.resolution = params.resolution;
    if (params.quality) payload.quality = params.quality;
    if (params.mode) payload.mode = params.mode;
    if (params.image_url) payload.image_url = params.image_url;
    return submitAndPoll(endpoint, payload, apiKey, params.onRequestId, 900);
}

export async function generateVideoEffect(params) {
    const apiKey = params.apiKey || null;
    const endpoint = 'generate_wan_ai_effects';
    const payload = {
        prompt: params.prompt,
        image_url: params.image_url,
        name: params.name,
        aspect_ratio: params.aspect_ratio || '9:16',
        size: params.size || '480*832',
        quality: params.quality || 'medium',
        duration: params.duration || 5,
    };
    return submitAndPoll(endpoint, payload, apiKey, params.onRequestId, 900);
}

export async function generateI2V(apiKey, params) {
    const modelInfo = getI2VModelById(params.model);
    const endpoint = modelInfo?.endpoint || params.model;
    const payload = {};
    if (params.prompt) payload.prompt = params.prompt;
    const imageField = modelInfo?.imageField || 'image_url';
    if (params.image_url) {
        if (imageField === 'images_list') payload.images_list = [params.image_url];
        else payload[imageField] = params.image_url;
    }
    const lastImageField = modelInfo?.lastImageField;
    if (lastImageField && params.last_image) {
        payload[lastImageField] = params.last_image;
    }
    if (params.aspect_ratio) payload.aspect_ratio = params.aspect_ratio;
    if (params.duration) payload.duration = params.duration;
    if (params.resolution) payload.resolution = params.resolution;
    if (params.quality) payload.quality = params.quality;
    if (params.mode) payload.mode = params.mode;
    if (modelInfo?.inputs?.name) {
        payload.name = params.name || modelInfo.inputs.name.default;
    }
    return submitAndPoll(endpoint, payload, apiKey, params.onRequestId, 900);
}

export async function generateMarketingStudioAd(apiKey, params) {
    const endpoint = params.resolution === '1080p' ? 'sd-2-vip-omni-reference-1080p' : 'seedance-2-vip-omni-reference';
    const payload = {
        prompt: params.prompt,
        aspect_ratio: params.aspect_ratio || '16:9',
        duration: params.duration || 5,
        images_list: params.images_list || [],
        video_files: params.video_files || []
    };
    return submitAndPoll(endpoint, payload, apiKey, params.onRequestId, 900);
}

export async function processV2V(apiKey, params) {
    const modelInfo = getV2VModelById(params.model);
    const endpoint = modelInfo?.endpoint || params.model;
    const videoField = modelInfo?.videoField || 'video_url';
    const payload = { [videoField]: params.video_url };
    if (modelInfo?.imageField && params.image_url) {
        payload[modelInfo.imageField] = params.image_url;
    }
    if (modelInfo?.hasPrompt && params.prompt) {
        payload.prompt = params.prompt;
    }
    return submitAndPoll(endpoint, payload, apiKey, params.onRequestId, 900);
}

export async function processLipSync(apiKey, params) {
    const modelInfo = getLipSyncModelById(params.model);
    const endpoint = modelInfo?.endpoint || params.model;
    const payload = {};
    if (params.audio_url) payload.audio_url = params.audio_url;
    if (params.image_url) payload.image_url = params.image_url;
    if (params.video_url) payload.video_url = params.video_url;
    if (modelInfo?.hasPrompt) payload.prompt = params.prompt || '';
    if (params.resolution) payload.resolution = params.resolution;
    if (params.seed !== undefined && params.seed !== -1) payload.seed = params.seed;
    return submitAndPoll(endpoint, payload, apiKey, params.onRequestId, 900);
}

export async function generateAvatar(params) {
    const endpoint = 'avatar-animate';
    const payload = {
        video_url: params.video_url,
    };
    if (params.audio_url) payload.audio_url = params.audio_url;
    if (params.prompt) payload.prompt = params.prompt;
    const response = await fetch(`${BASE_URL}/api/v1/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': params.apiKey || '' },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Avatar generation failed: ${response.status} - ${errText.slice(0, 100)}`);
    }
    const submitData = await response.json();
    const requestId = submitData.request_id || submitData.id;
    if (!requestId) return submitData;
    return await pollForResult(requestId, params.apiKey || '', 900);
}

export async function generateAudio(params) {
    const endpoint = 'text-to-audio';
    const payload = {
        prompt: params.prompt,
        duration: params.duration || 30
    };
    if (params.model) payload.model = params.model;
    if (params.style) payload.style = params.style;
    const response = await fetch(`${BASE_URL}/api/v1/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': params.apiKey || '' },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Audio generation failed: ${response.status} - ${errText.slice(0, 100)}`);
    }
    const submitData = await response.json();
    const requestId = submitData.request_id || submitData.id;
    if (!requestId) return submitData;
    return await pollForResult(requestId, params.apiKey || '', 900);
}

export function uploadFile(apiKey, file, onProgress) {
    return new Promise((resolve, reject) => {
        const url = `${BASE_URL}/api/v1/upload_file`;
        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.setRequestHeader('x-api-key', apiKey);

        if (onProgress) {
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    onProgress(percentComplete);
                }
            };
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    const fileUrl = data.url || data.file_url || data.data?.url;
                    if (!fileUrl) {
                        reject(new Error('No URL returned from file upload'));
                    } else {
                        resolve(fileUrl);
                    }
                } catch (e) {
                    reject(new Error('Failed to parse upload response'));
                }
            } else {
                let detail = xhr.statusText;
                try {
                    const errObj = JSON.parse(xhr.responseText);
                    detail = errObj.detail || detail;
                } catch (e) {
                    // fallback to statusText
                }
                reject(new Error(`File upload failed: ${xhr.status} - ${detail}`));
            }
        };

        xhr.onerror = () => reject(new Error('Network error during file upload'));
        xhr.send(formData);
    });
}

export async function getUserBalance(apiKey) {
    const response = await fetch(`${BASE_URL}/api/v1/account/balance`, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        }
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to fetch balance: ${response.status} - ${errText.slice(0, 100)}`);
    }
    return await response.json();
}

export async function getTemplateWorkflows(apiKey) {
    const response = await fetch(`${BASE_URL}/workflow/get-template-workflows`, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        }
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to fetch template workflows: ${response.status} - ${errText.slice(0, 100)}`);
    }
    return await response.json();
};

export async function getUserWorkflows(apiKey) {
    const response = await fetch(`${BASE_URL}/workflow/get-workflow-defs`, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        }
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to fetch user workflows: ${response.status} - ${errText.slice(0, 100)}`);
    }
    return await response.json();
};

export async function getPublishedWorkflows(apiKey) {
    const response = await fetch(`${BASE_URL}/workflow/get-published-workflows`, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        }
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to fetch published workflows: ${response.status} - ${errText.slice(0, 100)}`);
    }
    return await response.json();
};

// Agents — uses direct URL → https://api.muapi.ai/agents/...
export async function getTemplateAgents(apiKey) {
    const response = await fetch(`${BASE_URL}/agents/templates/agents`, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        }
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to fetch template agents: ${response.status} - ${errText.slice(0, 100)}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : (data.agents || data.items || []);
};

export async function getUserAgents(apiKey) {
    const response = await fetch(`${BASE_URL}/agents/user/agents`, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        }
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to fetch user agents: ${response.status} - ${errText.slice(0, 100)}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : (data.agents || data.items || []);
};

export async function getPublishedAgents(apiKey) {
    // MuAPI: GET /agents/featured/agents
    const response = await fetch(`${BASE_URL}/agents/featured/agents`, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        }
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to fetch featured agents: ${response.status} - ${errText.slice(0, 100)}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : (data.agents || data.items || []);
};

// GET /agents/user/conversations — returns the user's chat history across all agents
export async function getUserConversations(apiKey) {
    const response = await fetch(`${BASE_URL}/agents/user/conversations`, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        }
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to fetch conversations: ${response.status} - ${errText.slice(0, 100)}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
};

export async function createWorkflow(apiKey, payload) {
    const response = await fetch(`${BASE_URL}/workflow/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to create workflow: ${response.status} - ${errText.slice(0, 100)}`);
    }
    return await response.json();
};

export async function updateWorkflowName(apiKey, workflowId, name) {
    const response = await fetch(`${BASE_URL}/workflow/update-name/${workflowId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        },
        body: JSON.stringify({ name })
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to rename workflow: ${response.status} - ${errText.slice(0, 100)}`);
    }
    return await response.json();
};

export async function deleteWorkflow(apiKey, workflowId) {
    const response = await fetch(`${BASE_URL}/workflow/delete-workflow-def/${workflowId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        }
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to delete workflow: ${response.status} - ${errText.slice(0, 100)}`);
    }
    return await response.json();
};

export async function getWorkflowInputs(apiKey, workflowId) {
    const response = await fetch(`${BASE_URL}/workflow/${workflowId}/api-inputs`, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        }
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to fetch workflow inputs: ${response.status} - ${errText.slice(0, 100)}`);
    }
    return await response.json();
};

export async function executeWorkflow(apiKey, workflowId, inputs) {
    const response = await fetch(`${BASE_URL}/workflow/${workflowId}/api-execute`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        },
        body: JSON.stringify({ inputs })
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to execute workflow: ${response.status} - ${errText.slice(0, 100)}`);
    }
    const submitData = await response.json();
    const runId = submitData.run_id || submitData.id;
    if (!runId) return submitData;
    
    // Poll for results
    return await pollWorkflowResult(runId, apiKey);
};

async function pollWorkflowResult(runId, apiKey, maxAttempts = 900, interval = 2000) {
    const pollUrl = `${BASE_URL}/workflow/run/${runId}/api-outputs`;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        await new Promise(resolve => setTimeout(resolve, interval));
        try {
            const response = await fetch(pollUrl, {
                headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }
            });
            if (!response.ok) {
                if (response.status >= 500) continue;
                throw new Error(`Poll Failed: ${response.status}`);
            }
            const data = await response.json();
            const status = data.status?.toLowerCase();
            if (status === 'completed' || status === 'succeeded' || status === 'success') return data;
            if (status === 'failed' || status === 'error') throw new Error(`Workflow failed: ${data.error || 'Unknown error'}`);
        } catch (error) {
            if (attempt === maxAttempts) throw error;
        }
    }
    throw new Error('Workflow timed out after polling.');
};

export async function getAllNodeSchemas(apiKey, workflowId) {
    const response = await fetch(`${BASE_URL}/workflow/${workflowId}/node-schemas`, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        }
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to fetch node schemas: ${response.status} - ${errText.slice(0, 100)}`);
    }
    return await response.json();
};

export async function getWorkflowData(apiKey, workflowId) {
    const response = await fetch(`${BASE_URL}/workflow/get-workflow-def/${workflowId}`, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        }
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to fetch workflow data: ${response.status} - ${errText.slice(0, 100)}`);
    }
    return await response.json();
};

export async function getNodeSchemas(apiKey, workflowId) {
    const response = await fetch(`${BASE_URL}/workflow/${workflowId}/api-node-schemas`, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        }
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to fetch node schemas: ${response.status} - ${errText.slice(0, 100)}`);
    }
    return await response.json();
}

export async function runSingleNode(apiKey, workflowId, nodeId, payload) {
    const response = await fetch(`${BASE_URL}/workflow/${workflowId}/node/${nodeId}/run`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to run single node: ${response.status} - ${errText.slice(0, 100)}`);
    }
    return await response.json();
}

export async function deleteNodeRun(apiKey, nodeRunId) {
    const response = await fetch(`${BASE_URL}/workflow/node-run/${nodeRunId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        }
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to delete node run: ${response.status} - ${errText.slice(0, 100)}`);
    }
    return await response.json();
}

export async function getNodeStatus(apiKey, runId) {
    const response = await fetch(`${BASE_URL}/workflow/run/${runId}/status`, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        }
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to get node status: ${response.status} - ${errText.slice(0, 100)}`);
    }
    return await response.json();
}

/**
 * Handle proxy requests centralizing communication logic with MuAPI.
 * This is used by the server-side entry points.
 */
export async function handleProxyRequest(prefix, path, method, headers, body, apiKey) {
    const url = `${BASE_URL}/${prefix}/${path}`;
    
    const finalHeaders = new Headers(headers);
    finalHeaders.delete('host');
    finalHeaders.delete('connection');
    finalHeaders.delete('content-length'); // Let fetch recalculate this for safety

    if (apiKey) {
        finalHeaders.set('x-api-key', apiKey);
    }

    try {
        const response = await fetch(url, {
            method,
            headers: finalHeaders,
            body: (method !== 'GET' && method !== 'HEAD') ? body : undefined,
            redirect: 'follow',
        });

        const contentType = response.headers.get('Content-Type') || 'application/json';
        const buffer = await response.arrayBuffer();
        
        return {
            status: response.status,
            contentType,
            data: buffer
        };
    } catch (error) {
        console.error(`MuAPI Proxy error for ${url}:`, error);
        throw error;
    }
}

/**
 * A centralized handler for Next.js API routes or middleware.
 */
export async function handleServerSideProxy(prefix, request, params, apiKey) {
    try {
        const slug = await params;
        const pathSegments = slug.path || [];
        const path = pathSegments.join('/');
        
        const method = request.method;
        let body = null;
        if (method !== 'GET' && method !== 'HEAD') {
            body = await request.arrayBuffer();
        }

        const { search } = new URL(request.url);
        const pathWithSearch = search ? `${path}${search}` : path;

        return await handleProxyRequest(
            prefix, 
            pathWithSearch, 
            method, 
            request.headers, 
            body, 
            apiKey
        );
    } catch (error) {
        console.error(`Server proxy failed:`, error);
        throw error;
    }
}

export async function calculateDynamicCost(apiKey, taskName, payload) {
    const response = await fetch(`${BASE_URL}/api/v1/app/calculate_dynamic_cost`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        },
        body: JSON.stringify({ task_name: taskName, payload })
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to calculate dynamic cost: ${response.status} - ${errText.slice(0, 100)}`);
    }
    return await response.json();
}

export async function registerAppInterest(apiKey, appName) {
    const response = await fetch(`${BASE_URL}/app/interest`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        },
        body: JSON.stringify({ app_name: appName })
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to register interest: ${response.status} - ${errText.slice(0, 100)}`);
    }
    return await response.json();
}

export async function getAppInterests(apiKey) {
    const response = await fetch(`${BASE_URL}/app/interests`, {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        }
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to fetch interests: ${response.status} - ${errText.slice(0, 100)}`);
    }
    return await response.json();
}

export async function runClipping(apiKey, params) {
    const payload = {
        video_url: params.video_url,
        num_highlights: params.num_highlights || 3,
        aspect_ratio: params.aspect_ratio || "9:16",
        return_coordinates_only: !!params.return_coordinates_only
    };
    return submitAndPoll("ai-clipping", payload, apiKey, params.onRequestId, 900);
}

export async function runMotionGraphics(apiKey, params) {
    const payload = {
        prompt: params.prompt,
        aspect_ratio: params.aspect_ratio || "16:9",
        duration_seconds: params.duration_seconds || 6,
    };
    return submitAndPoll("motion-graphics", payload, apiKey, params.onRequestId, 900);
}

export async function runMotionGraphicsEdit(apiKey, params) {
    const payload = {
        request_id: params.request_id,
        edit_prompt: params.edit_prompt,
        aspect_ratio: params.aspect_ratio || "16:9",
        duration_seconds: params.duration_seconds || 6,
    };
    return submitAndPoll("motion-graphics-edit", payload, apiKey, params.onRequestId, 900);
}

const muapi = new MuapiClient();

class MuapiClient {
    constructor() {
        this.apiKey = null;
    }

    setApiKey(key) {
        this.apiKey = key;
    }

    _resolve(...args) {
        if (args.length >= 2 && typeof args[0] === 'string') {
            return [args[0], ...args.slice(1)];
        }
        return [this.apiKey, ...args];
    }

    async generateImage(...args) { return generateImage(...this._resolve(...args)); }
    async generateI2I(...args) { return generateI2I(...this._resolve(...args)); }
    async generateVideo(...args) { return generateVideo(...this._resolve(...args)); }
    async generateI2V(...args) { return generateI2V(...this._resolve(...args)); }
    async generateVideoEffect(...args) {
        const [apiKey, params] = this._resolve(...args);
        return generateVideoEffect({ ...params, apiKey });
    }
    async generateMarketingStudioAd(...args) { return generateMarketingStudioAd(...this._resolve(...args)); }
    async processV2V(...args) { return processV2V(...this._resolve(...args)); }
    async processLipSync(...args) { return processLipSync(...this._resolve(...args)); }
    async generateAvatar(...args) {
        const [apiKey, params] = this._resolve(...args);
        return generateAvatar({ ...params, apiKey });
    }
    async generateAudio(...args) {
        const [apiKey, params] = this._resolve(...args);
        return generateAudio({ ...params, apiKey });
    }
    async uploadFile(...args) { return uploadFile(this.apiKey, ...args); }
    async getUserBalance() { return getUserBalance(this.apiKey); }
    async getTemplateWorkflows() { return getTemplateWorkflows(this.apiKey); }
    async getUserWorkflows() { return getUserWorkflows(this.apiKey); }
    async getPublishedWorkflows() { return getPublishedWorkflows(this.apiKey); }
    async getTemplateAgents() { return getTemplateAgents(this.apiKey); }
    async getUserAgents() { return getUserAgents(this.apiKey); }
    async getPublishedAgents() { return getPublishedAgents(this.apiKey); }
    async getUserConversations() { return getUserConversations(this.apiKey); }
    async createWorkflow(payload) { return createWorkflow(this.apiKey, payload); }
    async updateWorkflowName(workflowId, name) { return updateWorkflowName(this.apiKey, workflowId, name); }
    async deleteWorkflow(workflowId) { return deleteWorkflow(this.apiKey, workflowId); }
    async getWorkflowInputs(workflowId) { return getWorkflowInputs(this.apiKey, workflowId); }
    async executeWorkflow(workflowId, inputs) { return executeWorkflow(this.apiKey, workflowId, inputs); }
    async getAllNodeSchemas(workflowId) { return getAllNodeSchemas(this.apiKey, workflowId); }
    async getWorkflowData(workflowId) { return getWorkflowData(this.apiKey, workflowId); }
    async getNodeSchemas(workflowId) { return getNodeSchemas(this.apiKey, workflowId); }
    async runSingleNode(workflowId, nodeId, payload) { return runSingleNode(this.apiKey, workflowId, nodeId, payload); }
    async deleteNodeRun(nodeRunId) { return deleteNodeRun(this.apiKey, nodeRunId); }
    async getNodeStatus(runId) { return getNodeStatus(this.apiKey, runId); }
    async handleProxyRequest(prefix, path, method, headers, body) { return handleProxyRequest(prefix, path, method, headers, body, this.apiKey); }
    async handleServerSideProxy(prefix, request, params) { return handleServerSideProxy(prefix, request, params, this.apiKey); }
    async calculateDynamicCost(taskName, payload) { return calculateDynamicCost(this.apiKey, taskName, payload); }
    async registerAppInterest(appName) { return registerAppInterest(this.apiKey, appName); }
    async getAppInterests() { return getAppInterests(this.apiKey); }
    async runClipping(...args) { return runClipping(...this._resolve(...args)); }
    async runMotionGraphics(...args) { return runMotionGraphics(...this._resolve(...args)); }
    async runMotionGraphicsEdit(...args) { return runMotionGraphicsEdit(...this._resolve(...args)); }
    async submitOnly(endpoint, payload) { return submitOnly(endpoint, payload, this.apiKey); }
    async checkStatus(requestId) { return checkStatus(requestId, this.apiKey); }
    async pollForResult(...args) {
        let requestId, apiKey, maxAttempts, interval;
        if (args.length === 1) {
            requestId = args[0]; apiKey = this.apiKey; maxAttempts = 900; interval = 2000;
        } else if (args.length === 2) {
            [requestId, apiKey] = args; maxAttempts = 900; interval = 2000;
        } else if (typeof args[1] === 'number') {
            [requestId, maxAttempts, interval] = args; apiKey = this.apiKey;
        } else {
            [requestId, apiKey, maxAttempts, interval] = args;
        }
        return pollForResult(requestId, apiKey, maxAttempts, interval);
    }
    async downloadResult(url) { return downloadResult(url); }
}

// ============================================================================
// NON-BLOCKING SUBMIT + POLL (for generationService.js)
// These are additive: they don't change the existing submitAndPoll behavior.
// Callers that want fire-and-forget submit use submitOnly, then checkStatus
// to poll a single time. Callers that want blocking submit+poll keep using
// the existing generateVideo/generateImage/etc. functions.
// ============================================================================

/**
 * Submit a generation request WITHOUT polling. Returns the requestId
 * immediately so the caller can poll separately via checkStatus().
 *
 * @param {string} endpoint - The MuAPI endpoint (e.g. 'generate_video')
 * @param {Object} payload - Request payload
 * @param {string} key - API key (null for proxy path)
 * @returns {Promise<{ requestId: string|null, submitData: Object }>}
 */
export async function submitOnly(endpoint, payload, key) {
    const url = `${BASE_URL}/api/v1/${endpoint}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': key },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Request Failed: ${response.status} ${response.statusText} - ${errText.slice(0, 100)}`);
    }
    const submitData = await response.json();
    const requestId = submitData.request_id || submitData.id || null;
    return { requestId, submitData };
}

/**
 * Check the status of a generation request ONCE (single poll).
 * Returns { status, progress, url, error, data }.
 *
 * Status values: 'queued' | 'processing' | 'completed' | 'failed'.
 *
 * @param {string} requestId - The request ID from submitOnly
 * @param {string} key - API key (null for proxy path)
 * @returns {Promise<Object>}
 */
export async function checkStatus(requestId, key) {
    if (!requestId) {
        return { status: 'failed', error: 'No requestId provided' };
    }
    const pollUrl = `${BASE_URL}/api/v1/predictions/${requestId}/result`;
    try {
        const response = await fetch(pollUrl, {
            headers: { 'Content-Type': 'application/json', 'x-api-key': key }
        });
        if (!response.ok) {
            const errText = await response.text();
            if (response.status >= 500) {
                return { status: 'processing', error: `Server error: ${response.status}`, retryable: true };
            }
            return { status: 'failed', error: `Poll Failed: ${response.status} - ${errText.slice(0, 100)}` };
        }
        const data = await response.json();
        const status = (data.status || '').toLowerCase();
        const outputUrl = data.outputs?.[0] || data.url || data.output?.url || null;
        if (status === 'completed' || status === 'succeeded' || status === 'success') {
            return { status: 'completed', url: outputUrl, data, progress: 100 };
        }
        if (status === 'failed' || status === 'error') {
            return { status: 'failed', error: data.error || 'Generation failed', data };
        }
        // Still processing — estimate progress from attempt count if available
        const progress = data.progress != null ? data.progress : 50;
        return { status: 'processing', progress, data, url: null };
    } catch (error) {
        return { status: 'failed', error: error.message || 'Poll request failed', retryable: true };
    }
}

/**
 * Download the result of a completed generation. Fetches the URL and
 * returns a Blob. Returns null if no URL or fetch fails.
 *
 * @param {string} url - The result URL from a completed generation
 * @returns {Promise<Blob|null>}
 */
export async function downloadResult(url) {
    if (!url) return null;
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        return await response.blob();
    } catch (e) {
        return null;
    }
}

export { muapi, MuapiClient };
