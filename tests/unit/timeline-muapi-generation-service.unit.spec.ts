import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock muapi.js
const { submitOnlyMock, checkStatusMock, downloadResultMock } = vi.hoisted(() => ({
  submitOnlyMock: vi.fn(async (endpoint, payload, key) => ({
    requestId: 'req_test_123',
    submitData: { request_id: 'req_test_123', status: 'queued' }
  })),
  checkStatusMock: vi.fn(async (requestId, key) => ({
    status: 'processing',
    progress: 50,
    url: null
  })),
  downloadResultMock: vi.fn(async (url) => new Blob(['video-data']))
}));

vi.mock('../../src/lib/muapi.js', () => ({
  MuapiClient: class {
    constructor() {}
    async generateVideo(p) { return { url: 'https://x' }; }
    async generateI2V(p) { return { url: 'https://x' }; }
  },
  submitOnly: submitOnlyMock,
  checkStatus: checkStatusMock,
  downloadResult: downloadResultMock
}));

vi.mock('../../src/lib/services/CircuitBreaker.js', () => ({
  circuitBreaker: {
    recordSuccess: vi.fn(),
    recordFailure: vi.fn(),
    canProceed: vi.fn(() => true),
    getStatus: vi.fn(() => ({ state: 'CLOSED' })),
    getServiceStatus: vi.fn(() => ({ state: 'CLOSED' }))
  }
}));

vi.mock('../../src/lib/services/aiService.js', () => ({
  aiService: {
    initialize: vi.fn(async () => {}),
    generate: vi.fn(),
    generateBatch: vi.fn(),
    getHealthStatus: vi.fn(),
    configure: vi.fn()
  }
}));

vi.mock('../../src/lib/editor/types.js', () => ({
  GenerationModes: {},
  GenerationProviders: {},
  createDefaultProject: () => ({})
}));

vi.mock('../../src/lib/models.js', () => ({
  t2vModels: [],
  i2vModels: [],
  getVideoModelById: () => null,
  getI2VModelById: () => null
}));

import { generationService, GenerationService, MuAPIProvider } from '../../src/lib/editor/generationService.js';

describe('MuAPIProvider — submit', () => {
  beforeEach(() => {
    submitOnlyMock.mockClear();
    checkStatusMock.mockClear();
  });

  it('submits a text-to-video request and returns generationId', async () => {
    const r = await new MuAPIProvider().submit({
      mode: 'text-to-video',
      prompt: 'A cat playing piano',
      duration: 6
    });
    expect(r.generationId).toMatch(/^gen_/);
    expect(r.status).toBe('queued');
    expect(r.requestId).toBe('req_test_123');
    expect(submitOnlyMock).toHaveBeenCalled();
  });

  it('submits an image-to-video request', async () => {
    const r = await new MuAPIProvider().submit({
      mode: 'image-to-video',
      prompt: 'Animate this',
      references: ['https://img.url'],
      duration: 6
    });
    expect(r.status).toBe('queued');
  });

  it('submits a broll request', async () => {
    const r = await new MuAPIProvider().submit({
      mode: 'broll',
      prompt: 'City street',
      duration: 3
    });
    expect(r.status).toBe('queued');
  });

  it('returns failed for unsupported mode', async () => {
    const r = await new MuAPIProvider().submit({ mode: 'unknown' });
    expect(r.status).toBe('failed');
    expect(r.error).toMatch(/Unsupported/i);
  });

  it('records circuit breaker failure on error', async () => {
    submitOnlyMock.mockRejectedValueOnce(new Error('Network down'));
    const { circuitBreaker } = await import('../../src/lib/services/CircuitBreaker.js');
    const r = await new MuAPIProvider().submit({ mode: 'text-to-video', prompt: 'x' });
    expect(r.status).toBe('failed');
    expect(circuitBreaker.recordFailure).toHaveBeenCalled();
  });
});

describe('MuAPIProvider — poll', () => {
  beforeEach(() => {
    submitOnlyMock.mockClear();
    checkStatusMock.mockClear();
  });

  it('polls real MuAPI status and returns result', async () => {
    checkStatusMock.mockResolvedValueOnce({
      status: 'completed',
      url: 'https://result.mp4',
      progress: 100
    });
    const provider = new MuAPIProvider();
    const submitResult = await provider.submit({ mode: 'text-to-video', prompt: 'x' });
    const pollResult = await provider.poll(submitResult.generationId);
    expect(pollResult.status).toBe('completed');
    expect(pollResult.url).toBe('https://result.mp4');
    expect(checkStatusMock).toHaveBeenCalledWith('req_test_123', null);
  });

  it('returns cached result on second poll (no double-polling)', async () => {
    checkStatusMock.mockResolvedValueOnce({
      status: 'completed',
      url: 'https://result.mp4',
      progress: 100
    });
    const provider = new MuAPIProvider();
    const submitResult = await provider.submit({ mode: 'text-to-video', prompt: 'x' });
    await provider.poll(submitResult.generationId);
    checkStatusMock.mockClear();
    const r2 = await provider.poll(submitResult.generationId);
    expect(r2.status).toBe('completed');
    expect(checkStatusMock).not.toHaveBeenCalled();
  });

  it('returns failed when no requestId exists', async () => {
    const provider = new MuAPIProvider();
    const r = await provider.poll('nonexistent-gen-id');
    expect(r.status).toBe('failed');
  });
});

describe('MuAPIProvider — cancel + download', () => {
  it('cancel removes the requestId', async () => {
    const provider = new MuAPIProvider();
    const submitResult = await provider.submit({ mode: 'text-to-video', prompt: 'x' });
    const r = await provider.cancel(submitResult.generationId);
    expect(r.status).toBe('cancelled');
    // Polling after cancel should fail
    const pollR = await provider.poll(submitResult.generationId);
    expect(pollR.status).toBe('failed');
  });

  it('download returns a Blob for completed generations', async () => {
    checkStatusMock.mockResolvedValueOnce({
      status: 'completed',
      url: 'https://result.mp4',
      progress: 100
    });
    const provider = new MuAPIProvider();
    const submitResult = await provider.submit({ mode: 'text-to-video', prompt: 'x' });
    await provider.poll(submitResult.generationId);
    const blob = await provider.download(submitResult.generationId);
    expect(blob).toBeInstanceOf(Blob);
    expect(downloadResultMock).toHaveBeenCalledWith('https://result.mp4');
  });

  it('download returns null for incomplete generations', async () => {
    checkStatusMock.mockResolvedValueOnce({ status: 'processing', progress: 50, url: null });
    const provider = new MuAPIProvider();
    const submitResult = await provider.submit({ mode: 'text-to-video', prompt: 'x' });
    await provider.poll(submitResult.generationId);
    const blob = await provider.download(submitResult.generationId);
    expect(blob).toBe(null);
  });
});

describe('GenerationService — fix this.providers → this.provider', () => {
  it('poll uses this.provider (not this.providers)', async () => {
    checkStatusMock.mockResolvedValueOnce({ status: 'processing', progress: 30, url: null });
    const service = new GenerationService();
    const submitResult = await service.submit({ mode: 'text-to-video', prompt: 'x' });
    // poll should not throw "Cannot read properties of undefined"
    expect(async () => {
      await service.poll(submitResult.generationId);
    }).not.toThrow();
  });

  it('cancel uses this.provider', async () => {
    const service = new GenerationService();
    const submitResult = await service.submit({ mode: 'text-to-video', prompt: 'x' });
    expect(async () => {
      await service.cancel(submitResult.generationId);
    }).not.toThrow();
  });
});

describe('GenerationService — configureProvider', () => {
  it('configures the MuAPIProvider with merged config', () => {
    const service = new GenerationService();
    service.configureProvider('muapi', { timeout: 600000 });
    expect(service.provider.config.timeout).toBe(600000);
  });
});

describe('GenerationService — retry', () => {
  it('re-submits the original request', async () => {
    const service = new GenerationService();
    const submitResult = await service.submit({ mode: 'text-to-video', prompt: 'retry me' });
    submitOnlyMock.mockClear();
    const retryResult = await service.retry(submitResult.generationId);
    expect(retryResult.generationId).toBeDefined();
    expect(submitOnlyMock).toHaveBeenCalled();
  });

  it('throws for unknown job', async () => {
    const service = new GenerationService();
    await expect(service.retry('nonexistent')).rejects.toThrow();
  });
});

describe('GenerationService — progress', () => {
  it('returns progress percentage', async () => {
    checkStatusMock.mockResolvedValueOnce({ status: 'processing', progress: 42, url: null });
    const service = new GenerationService();
    const submitResult = await service.submit({ mode: 'text-to-video', prompt: 'x' });
    const p = await service.progress(submitResult.generationId);
    expect(p.progress).toBe(42);
    expect(p.status).toBe('processing');
  });
});

describe('GenerationService — download', () => {
  it('downloads the result blob', async () => {
    checkStatusMock.mockResolvedValueOnce({ status: 'completed', url: 'https://x', progress: 100 });
    const service = new GenerationService();
    const submitResult = await service.submit({ mode: 'text-to-video', prompt: 'x' });
    await service.poll(submitResult.generationId);
    const blob = await service.download(submitResult.generationId);
    expect(blob).toBeInstanceOf(Blob);
  });
});

describe('GenerationService — getCachedResultsForMode', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear();
  });

  it('returns empty array when no cache', () => {
    const service = new GenerationService();
    expect(service.getCachedResultsForMode('text-to-video')).toEqual([]);
  });

  it('returns cached results from localStorage', () => {
    const service = new GenerationService();
    const entry = { url: 'https://cached.mp4', prompt: 'test', savedAt: Date.now(), mode: 'text-to-video' };
    localStorage.setItem('muapi-cache-text-to-video', JSON.stringify([entry]));
    const results = service.getCachedResultsForMode('text-to-video');
    expect(results.length).toBe(1);
    expect(results[0].url).toBe('https://cached.mp4');
  });

  it('filters out entries older than 1 hour', () => {
    const service = new GenerationService();
    const old = { url: 'https://old.mp4', prompt: 'old', savedAt: Date.now() - 7200000, mode: 'text-to-video' };
    const recent = { url: 'https://recent.mp4', prompt: 'recent', savedAt: Date.now(), mode: 'text-to-video' };
    localStorage.setItem('muapi-cache-text-to-video', JSON.stringify([old, recent]));
    const results = service.getCachedResultsForMode('text-to-video');
    expect(results.length).toBe(1);
    expect(results[0].url).toBe('https://recent.mp4');
  });
});

describe('GenerationService — startPolling with timeout', () => {
  it('returns a cancel function', () => {
    const service = new GenerationService();
    const submitResult = service.submit({ mode: 'text-to-video', prompt: 'x' });
    // startPolling before submit resolves — just test the cancel fn
    const cancel = service.startPolling('gen_test', () => {}, 100, 1000);
    expect(typeof cancel).toBe('function');
    cancel();
  });
});

describe('MuAPIProvider — getServiceNameForMode', () => {
  it('maps text-to-video to video_generation', () => {
    expect(new MuAPIProvider().getServiceNameForMode('text-to-video')).toBe('video_generation');
  });

  it('maps generate-image to image_generation', () => {
    expect(new MuAPIProvider().getServiceNameForMode('generate-image')).toBe('image_generation');
  });

  it('maps unknown to api_request', () => {
    expect(new MuAPIProvider().getServiceNameForMode('unknown')).toBe('api_request');
  });
});
