import { getModelById, getVideoModelById, getI2IModelById, getI2VModelById, getV2VModelById } from './models.js';
import { uploadFileToStorage } from './supabase.js';

export class MuapiClient {
    constructor() {
        this.proxyUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/muapi-proxy`;
    }

    getKey() {
        const key = localStorage.getItem('muapi_key');
        if (!key) throw new Error('API Key missing. Please set it in Settings.');
        return key;
    }

    async generateImage(params) {
        const modelInfo = getModelById(params.model);
        const endpoint = modelInfo?.endpoint || params.model;

        const finalPayload = {
            prompt: params.prompt,
        };

        if (params.aspect_ratio) {
            finalPayload.aspect_ratio = params.aspect_ratio;
        }

        if (params.resolution) {
            finalPayload.resolution = params.resolution;
        }

        if (params.quality) {
            finalPayload.quality = params.quality;
        }

        if (params.image_url) {
            finalPayload.image_url = params.image_url;
            finalPayload.strength = params.strength || 0.6;
        } else {
            finalPayload.image_url = null;
        }

        if (params.seed && params.seed !== -1) {
            finalPayload.seed = params.seed;
        }

        try {
            const response = await fetch(this.proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    endpoint,
                    params: finalPayload,
                    generationType: 'image',
                    studioType: params.studioType || 'image'
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`API Request Failed: ${response.status} ${response.statusText} - ${errText.slice(0, 100)}`);
            }

            const submitData = await response.json();

            const requestId = submitData.request_id || submitData.id;
            if (!requestId) {
                return submitData;
            }

            const result = await this.pollForResult(requestId);

            const imageUrl = result.outputs?.[0] || result.url || result.output?.url;
            return { ...result, url: imageUrl };

        } catch (error) {
            throw error;
        }
    }

    async pollForResult(requestId, maxAttempts = 60, interval = 2000) {
        const pollUrl = `https://api.muapi.ai/api/v1/predictions/${requestId}/result`;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            await new Promise(resolve => setTimeout(resolve, interval));

            try {
                const response = await fetch(this.proxyUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        endpoint: `predictions/${requestId}/result`,
                        params: {},
                        generationType: 'poll'
                    })
                });

                if (!response.ok) {
                    if (response.status >= 500) continue;
                    const errText = await response.text();
                    throw new Error(`Poll Failed: ${response.status} - ${errText.slice(0, 100)}`);
                }

                const data = await response.json();

                const status = data.status?.toLowerCase();

                if (status === 'completed' || status === 'succeeded' || status === 'success') {
                    return data;
                }

                if (status === 'failed' || status === 'error') {
                    throw new Error(`Generation failed: ${data.error || 'Unknown error'}`);
                }

            } catch (error) {
                if (attempt === maxAttempts) throw error;
            }
        }

        throw new Error('Generation timed out after polling.');
    }

    async generateVideo(params) {
        const modelInfo = getVideoModelById(params.model);
        const endpoint = modelInfo?.endpoint || params.model;

        const finalPayload = {};

        if (params.prompt) finalPayload.prompt = params.prompt;
        if (params.request_id) finalPayload.request_id = params.request_id;
        if (params.aspect_ratio) finalPayload.aspect_ratio = params.aspect_ratio;
        if (params.duration) finalPayload.duration = params.duration;
        if (params.resolution) finalPayload.resolution = params.resolution;
        if (params.quality) finalPayload.quality = params.quality;
        if (params.image_url) finalPayload.image_url = params.image_url;

        try {
            const response = await fetch(this.proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    endpoint,
                    params: finalPayload,
                    generationType: 'video',
                    studioType: params.studioType || 'video'
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`API Request Failed: ${response.status} ${response.statusText} - ${errText.slice(0, 100)}`);
            }

            const submitData = await response.json();

            const requestId = submitData.request_id || submitData.id;
            if (!requestId) return submitData;

            const result = await this.pollForResult(requestId, 120, 2000);

            const videoUrl = result.outputs?.[0] || result.url || result.output?.url;
            return { ...result, url: videoUrl };

        } catch (error) {
            throw error;
        }
    }

    async generateI2I(params) {
        const modelInfo = getI2IModelById(params.model);
        const endpoint = modelInfo?.endpoint || params.model;

        const finalPayload = {};

        if (params.prompt) finalPayload.prompt = params.prompt;

        const imageField = modelInfo?.imageField || 'image_url';
        const imagesList = params.images_list?.length > 0 ? params.images_list : (params.image_url ? [params.image_url] : null);
        if (imagesList) {
            if (imageField === 'images_list') {
                finalPayload.images_list = imagesList;
            } else {
                finalPayload[imageField] = imagesList[0];
            }
        }

        if (params.aspect_ratio) finalPayload.aspect_ratio = params.aspect_ratio;
        if (params.resolution) finalPayload.resolution = params.resolution;
        if (params.quality) finalPayload.quality = params.quality;

        try {
            const response = await fetch(this.proxyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint,
                    params: finalPayload,
                    generationType: 'i2i',
                    studioType: params.studioType || 'edit'
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`API Request Failed: ${response.status} ${response.statusText} - ${errText.slice(0, 100)}`);
            }

            const submitData = await response.json();

            const requestId = submitData.request_id || submitData.id;
            if (!requestId) return submitData;

            const result = await this.pollForResult(requestId);
            const imageUrl = result.outputs?.[0] || result.url || result.output?.url;
            return { ...result, url: imageUrl };
        } catch (error) {
            throw error;
        }
    }

    async generateI2V(params) {
        const modelInfo = getI2VModelById(params.model);
        const endpoint = modelInfo?.endpoint || params.model;

        const finalPayload = {};

        if (params.prompt) finalPayload.prompt = params.prompt;

        const imageField = modelInfo?.imageField || 'image_url';
        if (params.image_url) {
            if (imageField === 'images_list') {
                finalPayload.images_list = [params.image_url];
            } else {
                finalPayload[imageField] = params.image_url;
            }
        }

        if (params.aspect_ratio) finalPayload.aspect_ratio = params.aspect_ratio;
        if (params.duration) finalPayload.duration = params.duration;
        if (params.resolution) finalPayload.resolution = params.resolution;
        if (params.quality) finalPayload.quality = params.quality;

        try {
            const response = await fetch(this.proxyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint,
                    params: finalPayload,
                    generationType: 'i2v',
                    studioType: params.studioType || 'video'
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`API Request Failed: ${response.status} ${response.statusText} - ${errText.slice(0, 100)}`);
            }

            const submitData = await response.json();

            const requestId = submitData.request_id || submitData.id;
            if (!requestId) return submitData;

            const result = await this.pollForResult(requestId, 120, 2000);
            const videoUrl = result.outputs?.[0] || result.url || result.output?.url;
            return { ...result, url: videoUrl };
        } catch (error) {
            throw error;
        }
    }

    async uploadFile(file) {
        return uploadFileToStorage(file);
    }

    async processV2V(params) {
        const modelInfo = getV2VModelById(params.model);
        const endpoint = modelInfo?.endpoint || params.model;

        const videoField = modelInfo?.videoField || 'video_url';
        const finalPayload = { [videoField]: params.video_url };

        try {
            const response = await fetch(this.proxyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    endpoint,
                    params: finalPayload,
                    generationType: 'v2v',
                    studioType: params.studioType || 'upscale'
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`API Request Failed: ${response.status} ${response.statusText} - ${errText.slice(0, 100)}`);
            }

            const submitData = await response.json();

            const requestId = submitData.request_id || submitData.id;
            if (!requestId) return submitData;

            const result = await this.pollForResult(requestId, 120, 2000);
            const videoUrl = result.outputs?.[0] || result.url || result.output?.url;
            return { ...result, url: videoUrl };
        } catch (error) {
            throw error;
        }
    }

    getDimensionsFromAR(ar) {
        switch (ar) {
            case '1:1': return [1024, 1024];
            case '16:9': return [1280, 720];
            case '9:16': return [720, 1280];
            case '4:3': return [1152, 864];
            case '3:2': return [1216, 832];
            case '21:9': return [1536, 640];
            default: return [1024, 1024];
        }
    }
}

export const muapi = new MuapiClient();
