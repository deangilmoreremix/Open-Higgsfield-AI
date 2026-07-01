import { providers } from './providers.js';
import { assetLifecycle } from './asset-lifecycle-manager.js';
import { realtimeTracker } from './realtime-execution-tracker.js';
import { isSupabaseConfigured } from './supabase.js';

class MuAPIGenerationPipeline {
  constructor(options = {}) {
    this.apiKey = options.apiKey || import.meta?.env?.VITE_MUAPI_KEY;
    this.baseUrl = options.baseUrl || 'https://api.muapi.dev';
    this.models = options.models || {
      image: 'v1',
      video: 'video-v1',
      upscale: 'upscale-v1'
    };
    this.providers = options.providers || providers;
    this.assetLifecycle = options.hasOwnProperty('assetLifecycle') ? options.assetLifecycle : assetLifecycle;
  }

  async generateImage(prompt, options = {}) {
    const { width, height, steps, cfg, sampler, seed } = options;

    const payload = {
      prompt,
      width: width || 1024,
      height: height || 1024,
      steps: steps || 20,
      cfg: cfg || 7.5,
      sampler: sampler || 'Euler a',
      seed: seed || Math.floor(Math.random() * 2147483647)
    };

    const provider = await this.providers.get('muapi').catch(() => null);

    if (provider) {
      return await this.executeWithProvider('image', payload, provider);
    }

    return await this.generateDirectly('v1', payload);
  }

  async generateVideo(prompt, options = {}) {
    const { duration, width, height, fps } = options;

    const payload = {
      prompt,
      duration: duration || 5,
      width: width || 512,
      height: height || 512,
      fps: fps || 24
    };

    return await this.generateDirectly('video-v1', payload);
  }

  async upscaleImage(url, options = {}) {
    const payload = {
      url,
      scale: options.scale || 2,
      denoise: options.denoise || 0.5
    };

    return await this.generateDirectly('upscale-v1', payload);
  }

  async generateDirectly(model, payload) {
    const response = await fetch(`${this.baseUrl}/v1/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model,
        ...payload
      })
    });

    if (!response.ok) {
      throw new Error(`MuAPI request failed: ${response.status}`);
    }

    return await response.json();
  }

  async executeWithProvider(type, payload, provider) {
    const providerUrl = provider.url || `${this.baseUrl}/v1/generate`;

    const response = await fetch(providerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey || this.apiKey}`
      },
      body: JSON.stringify({
        type,
        model: this.models[type] || model,
        ...payload
      })
    });

    if (!response.ok) {
      throw new Error(`Provider request failed: ${response.status}`);
    }

    return await response.json();
  }

  async registerWithRuntime(workflowId) {
    const taskId = `muapi-${workflowId}-${Date.now()}`;

    return await executionRuntime.register?.(taskId, {
      type: 'ai-generation',
      provider: 'muapi',
      model: 'v1',
      payload: {}
    });
  }

  createGenerationTask(prompt, type = 'image', options = {}) {
    return {
      type: 'ai-generation',
      provider: 'muapi',
      model: this.models[type] || 'v1',
      payload: {
        type,
        prompt,
        settings: options
      }
    };
  }

  async executeTask(task, onProgress) {
    if (onProgress) {
      onProgress({ stage: 'initializing', progress: 0 });
    }

    let assetId = null;
    if (this.assetLifecycle && this.assetLifecycle.createAsset && isSupabaseConfigured()) {
      const asset = await this.assetLifecycle.createAsset({
        type: task.payload.type || 'image',
        provider: task.provider || 'muapi',
        model: task.model || 'v1',
        prompt: task.payload.prompt,
        settings: task.payload.settings
      });
      assetId = asset.id;

      if (onProgress) {
        onProgress({ stage: 'processing', progress: 50 });
      }

      if (this.assetLifecycle.updateState) {
        await this.assetLifecycle.updateState(asset.id, 'processing');
      }
    }

    let result;
    try {
      if (task.payload.type === 'video') {
        result = await this.generateVideo(task.payload.prompt, task.payload.settings);
      } else {
        result = await this.generateImage(task.payload.prompt, task.payload.settings);
      }
    } catch (error) {
      if (this.assetLifecycle && assetId) {
        if (this.assetLifecycle.updateState) {
          await this.assetLifecycle.updateState(assetId, 'failed');
        }
      }
      throw error;
    }

    if (this.assetLifecycle && assetId) {
      if (onProgress) {
        onProgress({ stage: 'completed', progress: 100 });
      }
      if (this.assetLifecycle.updateState) {
        await this.assetLifecycle.updateState(assetId, 'completed');
      }
    }

    return {
      success: true,
      assetId,
      result
    };
  }
}

const muAPIPipeline = new MuAPIGenerationPipeline();

export { MuAPIGenerationPipeline, muAPIPipeline };