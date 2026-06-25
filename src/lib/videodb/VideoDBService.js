/**
 * VideoDBService
 * Thin adapter over the VideoDB HTTP API using Node-native fetch.
 * Required by DirectorBackendService, DirectorAgentRuntime,
 * and src/components/video-search/VideoSearchModal.jsx.
 *
 * Interface is governed by tests/unit/videodb-director-integration.unit.spec.ts.
 */

const DEFAULT_BASE_URL = 'https://api.videodb.io/api/v1';

class VideoDBService {
  constructor(config = {}) {
    this.baseURL  = config.baseURL || DEFAULT_BASE_URL;
    this.apiKey   = config.apiKey || null;
    this.collectionId = config.collectionId || null;
    this.retryConfig = {
      maxRetries: config.maxRetries ?? 3,
      retryDelayMs: 1000
    };
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  setCollectionId(collectionId) {
    this.collectionId = collectionId;
  }

  _headers() {
    const h = { 'Content-Type': 'application/json' };
    if (this.apiKey) h['Authorization'] = `Bearer ${this.apiKey}`;
    return h;
  }

  async _request(path, options = {}) {
    const url = `${this.baseURL}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: { ...this._headers(), ...(options.headers || {}) }
    });

    const contentType = res.headers.get('content-type') || '';
    if (!res.ok) {
      let body = {};
      if (contentType.includes('application/json')) {
        body = await res.json().catch(() => ({}));
      } else {
        body = { message: await res.text().catch(() => res.statusText) };
      }
      const err = new Error(body.message || body.error || `VideoDB request failed: ${res.status}`);
      err.status = res.status;
      err.body = body;
      throw err;
    }

    if (res.status === 204) return null;
    if (contentType.includes('application/json')) return res.json();
    return res.text();
  }

  async _retry(fn) {
    let lastError;
    for (let attempt = 0; attempt < this.retryConfig.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        if (attempt < this.retryConfig.maxRetries - 1) {
          await new Promise(r => setTimeout(r, this.retryConfig.retryDelayMs * (attempt + 1)));
        }
      }
    }
    throw lastError;
  }

  async healthCheck() {
    if (!this.apiKey) throw new Error('VideoDB API key not configured');
    return this._retry(() => this._request('/health'));
  }

  async searchVideos(query, options = {}) {
    if (!this.apiKey) throw new Error('VideoDB API key not configured');
    const params = new URLSearchParams({ query, ...options });
    return this._retry(() =>
      this._request(`/videos/search?${params.toString()}`)
    );
  }

  async getVideo(videoId) {
    if (!this.apiKey) throw new Error('VideoDB API key not configured');
    return this._retry(() => this._request(`/videos/${encodeURIComponent(videoId)}`));
  }

  async getVideoScenes(videoId, options = {}) {
    if (!this.apiKey) throw new Error('VideoDB API key not configured');
    const params = new URLSearchParams(options);
    return this._retry(() =>
      this._request(`/videos/${encodeURIComponent(videoId)}/scenes?${params.toString()}`)
    );
  }

  async getVideoHighlights(videoId, options = {}) {
    if (!this.apiKey) throw new Error('VideoDB API key not configured');
    const params = new URLSearchParams(options);
    return this._retry(() =>
      this._request(`/videos/${encodeURIComponent(videoId)}/highlights?${params.toString()}`)
    );
  }

  async getCollections() {
    if (!this.apiKey) throw new Error('VideoDB API key not configured');
    return this._retry(() => this._request('/collections'));
  }

  async getCollectionVideos(collectionId, options = {}) {
    if (!this.apiKey) throw new Error('VideoDB API key not configured');
    const params = new URLSearchParams(options);
    return this._retry(() =>
      this._request(`/collections/${encodeURIComponent(collectionId)}/videos?${params.toString()}`)
    );
  }

  async indexVideo(videoId, options = {}) {
    if (!this.apiKey) throw new Error('VideoDB API key not configured');
    return this._retry(() =>
      this._request(`/videos/${encodeURIComponent(videoId)}/index`, {
        method: 'POST',
        body: JSON.stringify(options || {})
      })
    );
  }

  async generateSubtitles(videoId, options = {}) {
    if (!this.apiId) throw new Error('VideoDB API key not configured');
    return this._retry(() =>
      this._request(`/videos/${encodeURIComponent(videoId)}/subtitles`, {
        method: 'POST',
        body: JSON.stringify(options || {})
      })
    );
  }

  async transcribeVideo(videoId, options = {}) {
    if (!this.apiKey) throw new Error('VideoDB API key not configured');
    return this._retry(() =>
      this._request(`/videos/${encodeURIComponent(videoId)}/transcribe`, {
        method: 'POST',
        body: JSON.stringify(options || {})
      })
    );
  }

  async uploadVideo(file, options = {}) {
    if (!this.apiKey) throw new Error('VideoDB API key not configured');

    if (typeof file === 'object' && file.url) {
      return this._retry(() =>
        this._request('/videos/upload', {
          method: 'POST',
          body: JSON.stringify({ url: file.url, ...options })
        })
      );
    }

    if (typeof file === 'object' && file.path) {
      return this._retry(() => {
        const fs = await import('fs');
        const path = await import('path');
        const FormData = (await import('form-data')).default;
        const fileBuffer = fs.readFileSync(file.path);
        const form = new FormData();
        form.append('file', fileBuffer, { filename: path.basename(file.path) });
        Object.entries(options).forEach(([k, v]) => form.append(k, v));

        return fetch(`${this.baseURL}/videos/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${this.apiKey}`, ...form.getHeaders() },
          body: form
        }).then(async res => {
          if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            const err = new Error(errBody.message || `Upload failed: ${res.status}`);
            err.status = res.status;
            throw err;
          }
          return res.json();
        });
      });
    }

    throw new Error('Invalid file argument. Provide { url } or { path }');
  }
}

let _instance = null;

export function getVideoDBInstance(config) {
  if (!_instance) {
    _instance = new VideoDBService(config);
  }
  return _instance;
}

export { VideoDBService };
export default VideoDBService;
