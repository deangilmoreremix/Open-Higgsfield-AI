/* global FileReader */

/**
 * Generation Service
 * Unified abstraction layer for AI video generation via MuAPI
 * All generation routes through MuAPI which aggregates multiple providers
 */

import { GenerationModes, GenerationProviders, createDefaultProject } from './types.js';
import { MuapiClient, submitOnly, checkStatus, downloadResult } from '../muapi.js';
import { t2vModels, i2vModels, getVideoModelById, getI2VModelById } from '../models.js';
import { circuitBreaker } from '../services/CircuitBreaker.js';
import { aiService } from '../services/aiService.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const LTX_T2V_MODELS = {
  'ltx-2-pro': { id: 'ltx-2-pro-text-to-video', name: 'LTX 2 Pro', quality: 'high', speed: 'slow', duration: [6, 8, 10] },
  'ltx-2-fast': { id: 'ltx-2-fast-text-to-video', name: 'LTX 2 Fast', quality: 'medium', speed: 'fast', duration: [6, 8, 10, 12, 14, 16, 18, 20] },
  'ltx-2-19b': { id: 'ltx-2-19b-text-to-video', name: 'LTX 2 19B', quality: 'ultra', speed: 'slow', duration: [6, 8, 10] },
};

const LTX_I2V_MODELS = {
  'ltx-2-pro': { id: 'ltx-2-pro-image-to-video', name: 'LTX 2 Pro I2V', quality: 'high', speed: 'slow' },
  'ltx-2-fast': { id: 'ltx-2-fast-image-to-video', name: 'LTX 2 Fast I2V', quality: 'medium', speed: 'fast' },
  'ltx-2-19b': { id: 'ltx-2-19b-image-to-video', name: 'LTX 2 19B I2V', quality: 'ultra', speed: 'slow' },
};

const DEFAULT_CONFIG = {
  muapi: {
    timeout: 300000, // 5 minutes
    defaultModel: 'ltx-2-fast',
  },
};

// ============================================================================
// GENERATION REQUEST/RESULT
// ============================================================================

/**
 * @typedef {Object} GenerationRequest
 * @property {'text-to-video' | 'image-to-video' | 'audio-to-video' | 'retake' | 'extend' | 'broll' | 'variation'} mode
 * @property {string} prompt
 * @property {string} [negativePrompt]
 * @property {number} [duration]
 * @property {string} [aspectRatio]
 * @property {number} [fps]
 * @property {string[]} [references]
 * @property {string} [sourceAssetId]
 * @property {string} [selectedClipId]
 * @property {Object} [selectedRange]
 * @property {number} [selectedRange.start]
 * @property {number} [selectedRange.end]
 * @property {string} [stylePreset]
 * @property {string} [model] - LTX model variant ('ltx-2-pro', 'ltx-2-fast', 'ltx-2-19b')
 * @property {Object} [metadata]
 */

/**
 * @typedef {Object} GenerationResult
 * @property {string} generationId
 * @property {'queued' | 'processing' | 'completed' | 'failed'} status
 * @property {string[]} [assetIds]
 * @property {string} [previewUrl]
 * @property {string} [error]
 * @property {number} [progress] - Progress percentage (0-100)
 * @property {string} [progressMessage] - Human-readable progress message
 * @property {Object} [metadata]
 */

// ============================================================================
// MUAPI PROVIDER (Unified via MuAPI)
// ============================================================================

class MuAPIProvider {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG.muapi, ...config };
    this.client = new MuapiClient();
    // Map of generationId → requestId (for real polling)
    this.requestIds = new Map();
    // Map of generationId → completed result (cached from submit or poll)
    this.results = new Map();
  }

  /**
   * Submit a generation request. Returns immediately with a generationId
   * and status 'queued'. The actual MuAPI requestId is stored internally
   * for real polling via poll().
   */
  async submit(request) {
    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const serviceName = this.getServiceNameForMode(request.mode);

    try {
      // Build endpoint + payload based on mode
      const { endpoint, payload } = this.buildRequest(request);

      // Submit WITHOUT polling (fire-and-forget). The requestId is captured
      // for real status checks via poll().
      const { requestId, submitData } = await submitOnly(endpoint, payload, null);
      this.requestIds.set(generationId, requestId);

      // Record success with circuit breaker
      circuitBreaker.recordSuccess(serviceName);

      return {
        generationId,
        status: 'queued',
        requestId,
        previewUrl: null,
        assetIds: [],
        metadata: submitData,
      };
    } catch (error) {
      console.error(`[MuAPIProvider] Generation ${generationId} failed:`, error);

      // Record failure with circuit breaker (unless it's a circuit breaker error)
      if (error.code !== 'CIRCUIT_BREAKER_OPEN') {
        circuitBreaker.recordFailure(serviceName);
      }

      return {
        generationId,
        status: 'failed',
        error: error.message,
      };
    }
  }

  /**
   * Build the MuAPI endpoint + payload from a generation request.
   */
  buildRequest(request) {
    const modelKey = request.model || 'ltx-2-fast';

    switch (request.mode) {
      case 'text-to-video': {
        const modelInfo = LTX_T2V_MODELS[modelKey] || LTX_T2V_MODELS['ltx-2-fast'];
        return {
          endpoint: modelInfo.id,
          payload: {
            prompt: request.prompt,
            aspect_ratio: request.aspectRatio || '16:9',
            duration: request.duration || 6,
          }
        };
      }
      case 'image-to-video': {
        const modelInfo = LTX_I2V_MODELS[modelKey] || LTX_I2V_MODELS['ltx-2-fast'];
        return {
          endpoint: modelInfo.id,
          payload: {
            prompt: request.prompt,
            image_url: request.references?.[0] || request.sourceAssetId,
            aspect_ratio: request.aspectRatio || '16:9',
            duration: request.duration || 6,
          }
        };
      }
      case 'audio-to-video': {
        const modelInfo = LTX_T2V_MODELS[modelKey] || LTX_T2V_MODELS['ltx-2-fast'];
        return {
          endpoint: modelInfo.id,
          payload: {
            prompt: request.prompt || 'Video generated from audio',
            aspect_ratio: request.aspectRatio || '16:9',
            duration: request.duration || 6,
          }
        };
      }
      case 'retake': {
        const modelInfo = LTX_T2V_MODELS[modelKey] || LTX_T2V_MODELS['ltx-2-fast'];
        return {
          endpoint: modelInfo.id,
          payload: {
            prompt: request.prompt,
            aspect_ratio: request.aspectRatio || '16:9',
            duration: request.duration || 6,
          }
        };
      }
      case 'extend': {
        const modelInfo = LTX_T2V_MODELS[modelKey] || LTX_T2V_MODELS['ltx-2-fast'];
        return {
          endpoint: modelInfo.id,
          payload: {
            prompt: request.prompt || 'Continue the scene',
            aspect_ratio: request.aspectRatio || '16:9',
            duration: request.duration || 6,
          }
        };
      }
      case 'broll': {
        const modelInfo = LTX_T2V_MODELS[modelKey] || LTX_T2V_MODELS['ltx-2-fast'];
        return {
          endpoint: modelInfo.id,
          payload: {
            prompt: request.prompt,
            aspect_ratio: request.aspectRatio || '16:9',
            duration: request.duration || 3,
          }
        };
      }
      default:
        throw new Error(`Unsupported generation mode: ${request.mode}`);
    }
  }

  getServiceNameForMode(mode) {
    const serviceMap = {
      'text-to-video': 'video_generation',
      'image-to-video': 'video_generation',
      'audio-to-video': 'video_generation',
      'retake': 'video_generation',
      'extend': 'video_generation',
      'broll': 'video_generation',
      'generate-image': 'image_generation',
      'remove-background': 'background_removal',
      'text-to-speech': 'audio_generation'
    };
    return serviceMap[mode] || 'api_request';
  }

  /**
   * Poll for job status ONCE via real MuAPI checkStatus endpoint.
   * Returns { generationId, status, progress, url, error }.
   */
  async poll(generationId) {
    // If we already have a completed result cached, return it
    if (this.results.has(generationId)) {
      const cached = this.results.get(generationId);
      return { generationId, ...cached };
    }

    const requestId = this.requestIds.get(generationId);
    if (!requestId) {
      return { generationId, status: 'failed', error: 'No requestId for this generation' };
    }

    // Real single-poll against MuAPI
    const result = await checkStatus(requestId, null);

    const statusResult = {
      generationId,
      status: result.status,
      progress: result.progress != null ? result.progress : 0,
      url: result.url || null,
      error: result.error || null,
    };

    // Cache completed/failed results
    if (result.status === 'completed' || result.status === 'failed') {
      this.results.set(generationId, statusResult);
    }

    return statusResult;
  }

  /**
   * Cancel a generation. MuAPI doesn't have a dedicated cancel endpoint,
   * so we mark it as cancelled locally and stop tracking it.
   */
  async cancel(generationId) {
    this.requestIds.delete(generationId);
    this.results.delete(generationId);
    return { generationId, status: 'cancelled' };
  }

  /**
   * Download the result of a completed generation.
   */
  async download(generationId) {
    const result = this.results.get(generationId) || await this.poll(generationId);
    if (!result || !result.url) return null;
    return await downloadResult(result.url);
  }
}

// ============================================================================
// GENERATION SERVICE
// ============================================================================

class GenerationService {
  constructor() {
    this.provider = new MuAPIProvider();
    this.activeJobs = new Map();
    this.listeners = new Map();
    this.aiService = aiService;
    this.aiServiceEnabled = false;
  }

  /**
   * Enable AI service optimizations
   */
  async enableAIOptimizations() {
    if (!this.aiServiceEnabled) {
      await this.aiService.initialize();
      this.aiServiceEnabled = true;
      console.log('[GenerationService] AI optimizations enabled');
    }
  }

  configureProvider(name, config) {
    // Single-provider mode: reconfigure the MuAPIProvider with merged config
    if (name === 'muapi' || name === undefined) {
      this.provider.config = { ...this.provider.config, ...config };
    }
  }

  getAvailableProviders() {
    return ['muapi'];
  }

  async submit(request, provider = 'muapi') {
    // Use AI service optimizations if enabled
    if (this.aiServiceEnabled) {
      return await this.submitWithAIOptimizations(request, provider);
    }

    // Fallback to direct provider submission
    const result = await this.provider.submit(request);

    if (result.status !== 'failed') {
      this.activeJobs.set(result.generationId, {
        request,
        provider,
        status: result.status,
        createdAt: Date.now(),
      });

      this.emit('job-created', {
        generationId: result.generationId,
        provider,
        mode: request.mode,
      });
    }

    return result;
  }

  /**
   * Submit request with AI service optimizations
   */
  async submitWithAIOptimizations(request, provider = 'muapi') {
    const aiRequest = {
      type: request.mode,
      params: request,
      priority: this.determinePriority(request),
      metadata: {
        provider,
        generationMode: request.mode,
        model: request.model,
        source: 'generationService'
      }
    };

    try {
      const result = await this.aiService.generate(aiRequest);

      if (result.status !== 'failed') {
        this.activeJobs.set(result.generationId, {
          request,
          provider,
          status: result.status,
          createdAt: Date.now(),
        });

        this.emit('job-created', {
          generationId: result.generationId,
          provider,
          mode: request.mode,
        });
      }

      return result;
    } catch (error) {
      console.warn('[GenerationService] AI service failed, falling back to direct provider:', error.message);
      // Fallback to direct provider if AI service fails
      return await this.submit(request, provider);
    }
  }

  /**
   * Determine request priority based on generation mode and context
   */
  determinePriority(request) {
    const priorityMap = {
      'text-to-video': 'medium',
      'image-to-video': 'high',
      'retake': 'high',
      'extend': 'medium',
      'broll': 'low',
      'generate-image': 'high',
      'remove-background': 'low',
      'text-to-speech': 'medium'
    };

    return priorityMap[request.mode] || 'medium';
  }

  /**
   * Poll for job status
   * @param {string} generationId
   * @returns {Promise<GenerationResult>}
   */
  async poll(generationId) {
    const job = this.activeJobs.get(generationId);
    if (!job) {
      throw new Error(`Unknown job: ${generationId}`);
    }

    const result = await this.provider.poll(generationId);

    this.activeJobs.set(generationId, {
      ...job,
      status: result.status,
    });

    if (result.status === 'completed' || result.status === 'failed') {
      this.emit('job-completed', {
        generationId,
        status: result.status,
        result,
      });
    } else {
      this.emit('job-progress', {
        generationId,
        status: result.status,
        result,
      });
    }

    return result;
  }

  /**
   * Start polling for a job
   * @param {string} generationId
   * @param {Function} onUpdate
   * @param {number} interval
   */
  /**
   * Start polling for a job with real timeout handling.
   * @param {string} generationId
   * @param {Function} onUpdate - Called with each poll result
   * @param {number} interval - Poll interval in ms (default 2000)
   * @param {number} timeout - Max wait in ms (default 300000 = 5 min)
   * @returns {Function} Cancel function to stop polling early
   */
  startPolling(generationId, onUpdate, interval = 2000, timeout = 300000) {
    let cancelled = false;
    const startTime = Date.now();
    let timer = null;

    const poll = async () => {
      if (cancelled) return;
      if (Date.now() - startTime > timeout) {
        onUpdate({ generationId, status: 'failed', error: 'Generation timed out', progress: 0 });
        this.emit('job-timeout', { generationId });
        return;
      }
      const result = await this.poll(generationId);
      if (cancelled) return;
      onUpdate(result);

      if (result.status === 'processing' || result.status === 'queued') {
        timer = setTimeout(poll, interval);
      } else if (result.status === 'completed') {
        // Cache for graceful degradation
        const job = this.activeJobs.get(generationId);
        if (job) this.cacheResultForMode(job.request?.mode, result);
      }
    };

    timer = setTimeout(poll, interval);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }

  /**
   * Cancel a job
   * @param {string} generationId
   */
  async cancel(generationId) {
    const job = this.activeJobs.get(generationId);
    if (!job) {
      throw new Error(`Unknown job: ${generationId}`);
    }

    if (this.provider.cancel) {
      await this.provider.cancel(generationId);
    }

    this.activeJobs.delete(generationId);
    this.emit('job-cancelled', { generationId });
  }

  /**
   * Get all active jobs
   * @returns {Object[]}
   */
  getActiveJobs() {
    return Array.from(this.activeJobs.entries()).map(([id, job]) => ({
      generationId: id,
      ...job,
    }));
  }

  /**
   * Clear completed/failed jobs
   */
  clearCompletedJobs() {
    for (const [id, job] of this.activeJobs.entries()) {
      if (job.status === 'completed' || job.status === 'failed') {
        this.activeJobs.delete(id);
      }
    }
  }

  /**
   * Get available LTX models
   * @returns {Object} Model configurations
   */
  getLtxModels() {
    return LTX_T2V_MODELS;
  }

  /**
   * Get default LTX model
   * @returns {string} Default model key
   */
  getDefaultLtxModel() {
    return 'ltx-2-fast';
  }

  /**
   * Submit multiple requests in batch with AI optimizations
   * @param {Array} requests - Array of generation requests
   * @param {Object} options - Batch options
   * @returns {Promise<Array>} Array of results
   */
  async submitBatch(requests, options = {}) {
    if (!this.aiServiceEnabled) {
      // Fallback to sequential processing
      return await Promise.all(requests.map(req => this.submit(req)));
    }

    const aiRequests = requests.map(request => ({
      type: request.mode,
      params: request,
      priority: this.determinePriority(request),
      metadata: {
        provider: options.provider || 'muapi',
        generationMode: request.mode,
        model: request.model,
        source: 'generationService',
        batchId: options.batchId || Date.now()
      }
    }));

    try {
      const batchResults = await this.aiService.generateBatch(aiRequests, options);

      // Register jobs for tracking
      batchResults.forEach(result => {
        if (result.status !== 'failed') {
          const originalRequest = requests.find(req =>
            req.prompt === result.params?.prompt &&
            req.mode === result.params?.mode
          );

          if (originalRequest) {
            this.activeJobs.set(result.generationId, {
              request: originalRequest,
              provider: options.provider || 'muapi',
              status: result.status,
              createdAt: Date.now(),
            });

            this.emit('job-created', {
              generationId: result.generationId,
              provider: options.provider || 'muapi',
              mode: originalRequest.mode,
            });
          }
        }
      });

      return batchResults;
    } catch (error) {
      console.warn('[GenerationService] Batch processing failed, falling back to sequential:', error.message);
      return await Promise.all(requests.map(req => this.submit(req)));
    }
  }

  /**
   * Get circuit breaker status for graceful degradation
   * @returns {Object} Circuit breaker status
   */
  getCircuitBreakerStatus() {
    return circuitBreaker.getStatus();
  }

  /**
   * Check if a generation mode is available (circuit not open)
   * @param {string} mode - Generation mode
   * @returns {boolean} True if available
   */
  isGenerationModeAvailable(mode) {
    const serviceName = this.provider.getServiceNameForMode(mode);
    return circuitBreaker.canProceed(serviceName);
  }

  /**
   * Get graceful degradation options when circuit is open
   * @param {string} mode - Generation mode
   * @returns {Object} Degradation options
   */
  getDegradationOptions(mode) {
    const serviceName = this.provider.getServiceNameForMode(mode);
    const status = circuitBreaker.getServiceStatus(serviceName);

    if (status && status.state === 'OPEN') {
      return {
        available: false,
        reason: 'Service temporarily unavailable',
        retryAfter: Math.ceil(status.timeUntilRetry / 1000),
        alternatives: this.getAlternativeModes(mode),
        cachedResults: this.getCachedResultsForMode(mode)
      };
    }

    return {
      available: true,
      estimatedWaitTime: 0
    };
  }

  /**
   * Get alternative generation modes when primary mode is unavailable
   * @param {string} mode - Original mode
   * @returns {string[]} Alternative modes
   */
  getAlternativeModes(mode) {
    const alternatives = {
      'text-to-video': ['image-to-video', 'broll'],
      'image-to-video': ['text-to-video', 'broll'],
      'retake': ['text-to-video', 'extend'],
      'extend': ['text-to-video', 'broll'],
      'broll': ['text-to-video']
    };

    const altModes = alternatives[mode] || [];
    return altModes.filter(altMode => this.isGenerationModeAvailable(altMode));
  }

  /**
   * Get cached results for a mode (placeholder for future implementation)
   * @param {string} mode - Generation mode
   * @returns {Object[]} Cached results
   */
  getCachedResultsForMode(mode) {
    // Return recently generated content for this mode from localStorage.
    // Used for graceful degradation when the circuit breaker is open.
    try {
      const cacheKey = `muapi-cache-${mode}`;
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(cacheKey) : null;
      if (!raw) return [];
      const entries = JSON.parse(raw);
      if (!Array.isArray(entries)) return [];
      // Filter out entries older than 1 hour
      const oneHourAgo = Date.now() - 3600000;
      return entries.filter(e => e.savedAt && e.savedAt > oneHourAgo);
    } catch (e) {
      return [];
    }
  }

  /**
   * Cache a successful generation result for the mode (for graceful
   * degradation when the circuit breaker is open).
   */
  cacheResultForMode(mode, result) {
    try {
      if (!result || result.status !== 'completed') return;
      const cacheKey = `muapi-cache-${mode}`;
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(cacheKey) : null;
      const entries = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(entries)) entries.length = 0;
      entries.unshift({
        url: result.url || result.previewUrl,
        prompt: result.prompt,
        savedAt: Date.now(),
        mode
      });
      // Keep max 20 entries
      while (entries.length > 20) entries.pop();
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify(entries));
      }
    } catch (e) { /* best-effort */ }
  }

  /**
   * Retry a failed generation. Re-submits the original request.
   * @param {string} generationId
   * @param {Object} [overrides] - Optional request overrides
   * @returns {Promise<GenerationResult>}
   */
  async retry(generationId, overrides = {}) {
    const job = this.activeJobs.get(generationId);
    if (!job) throw new Error(`Unknown job: ${generationId}`);
    const request = { ...job.request, ...overrides };
    // Remove old job
    this.activeJobs.delete(generationId);
    // Re-submit
    return await this.submit(request, job.provider);
  }

  /**
   * Get current progress for a generation (0-100).
   * Polls once and returns the progress percentage.
   * @param {string} generationId
   * @returns {Promise<{ progress: number, status: string, message?: string }>}
   */
  async progress(generationId) {
    const result = await this.poll(generationId);
    return {
      progress: result.progress != null ? result.progress : 0,
      status: result.status,
      message: result.error || null
    };
  }

  /**
   * Download the result of a completed generation as a Blob.
   * @param {string} generationId
   * @returns {Promise<Blob|null>}
   */
  async download(generationId) {
    return await this.provider.download(generationId);
  }

  /**
   * Get AI service optimization status
   * @returns {Object} AI service status
   */
  getAIOptimizationStatus() {
    if (!this.aiServiceEnabled) {
      return { enabled: false };
    }

    return {
      enabled: true,
      health: this.aiService.getHealthStatus(),
      cacheStats: this.aiService.intelligentCache.getStats(),
      rateLimitStats: this.aiService.advancedRateLimiter.getStats(),
      deduplicationStats: this.aiService.requestDeduplicator.getStats()
    };
  }

  /**
   * Configure AI service optimizations
   * @param {Object} config - AI service configuration
   */
  configureAIOptimizations(config) {
    if (this.aiServiceEnabled) {
      this.aiService.configure(config);
    }
  }

  /**
   * Get available video models from MuAPI
   * @returns {Object[]} List of available video models
   */
  getAvailableVideoModels() {
    return t2vModels.map(m => ({
      id: m.id,
      name: m.name,
      type: 't2v'
    }));
  }

  /**
   * Get available image-to-video models from MuAPI
   * @returns {Object[]} List of available I2V models
   */
  getAvailableI2VModels() {
    return i2vModels.map(m => ({
      id: m.id,
      name: m.name,
      type: 'i2v'
    }));
  }

  /**
   * Add event listener
   * @param {string} event
   * @param {Function} callback
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event
   * @param {Function} callback
   */
  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   * @param {string} event
   * @param {Object} data
   */
  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => cb(data));
    }
  }
}

// ============================================================================
// CONVENIENCE METHODS
// ============================================================================

/**
 * Create a text-to-video request
 * @param {string} prompt
 * @param {Object} options
 * @returns {GenerationRequest}
 */
export function createTextToVideoRequest(prompt, options = {}) {
  return {
    mode: 'text-to-video',
    prompt,
    negativePrompt: options.negativePrompt,
    duration: options.duration,
    aspectRatio: options.aspectRatio,
    fps: options.fps,
    stylePreset: options.stylePreset,
    metadata: options.metadata,
  };
}

/**
 * Create an image-to-video request
 * @param {string} imageUrl
 * @param {string} prompt
 * @param {Object} options
 * @returns {GenerationRequest}
 */
export function createImageToVideoRequest(imageUrl, prompt, options = {}) {
  return {
    mode: 'image-to-video',
    prompt,
    negativePrompt: options.negativePrompt,
    references: [imageUrl],
    duration: options.duration,
    aspectRatio: options.aspectRatio,
    fps: options.fps,
    stylePreset: options.stylePreset,
    metadata: options.metadata,
  };
}

/**
 * Create a retake request
 * @param {string} sourceAssetId
 * @param {string} prompt
 * @param {Object} range
 * @param {Object} options
 * @returns {GenerationRequest}
 */
export function createRetakeRequest(sourceAssetId, prompt, range, options = {}) {
  return {
    mode: 'retake',
    prompt,
    negativePrompt: options.negativePrompt,
    sourceAssetId,
    selectedRange: range,
    duration: options.duration,
    stylePreset: options.stylePreset,
    metadata: options.metadata,
  };
}

/**
 * Create an extend request
 * @param {string} sourceAssetId
 * @param {string} prompt
 * @param {number} duration
 * @param {Object} options
 * @returns {GenerationRequest}
 */
export function createExtendRequest(sourceAssetId, prompt, duration, options = {}) {
  return {
    mode: 'extend',
    prompt,
    sourceAssetId,
    duration,
    metadata: options.metadata,
  };
}

/**
 * Create a B-roll request
 * @param {string} prompt
 * @param {Object} options
 * @returns {GenerationRequest}
 */
export function createBrollRequest(prompt, options = {}) {
  return {
    mode: 'broll',
    prompt,
    negativePrompt: options.negativePrompt,
    duration: options.duration || 3,
    aspectRatio: options.aspectRatio,
    metadata: options.metadata,
  };
}

/**
 * Create a Gemini image generation request
 * @param {string} prompt
 * @param {Object} options
 * @returns {GenerationRequest}
 */
export function createGeminiImageRequest(prompt, options = {}) {
  return {
    mode: 'generate-image',
    prompt,
    aspectRatio: options.aspectRatio || '1:1',
    metadata: options.metadata,
  };
}

/**
 * Create a background removal request
 * @param {string} imageUrl
 * @param {Object} options
 * @returns {GenerationRequest}
 */
export function createBackgroundRemovalRequest(imageUrl, options = {}) {
  return {
    mode: 'remove-background',
    references: [imageUrl],
    metadata: options.metadata,
  };
}

/**
 * Create a text-to-speech request
 * @param {string} text
 * @param {Object} options
 * @returns {GenerationRequest}
 */
export function createTextToSpeechRequest(text, options = {}) {
  return {
    mode: 'text-to-speech',
    text,
    metadata: options.metadata,
  };
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const generationService = new GenerationService();
export { GenerationService, MuAPIProvider };
export { LTX_T2V_MODELS, LTX_I2V_MODELS };
export default generationService;
