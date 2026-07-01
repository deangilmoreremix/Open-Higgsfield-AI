import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';

const { processFileUploadMock } = vi.hoisted(() => ({
  processFileUploadMock: vi.fn(async (file, opts) => ({
    success: true,
    asset: { id: 'a1', name: file.name, url: 'https://x' },
    clip: { id: 'c1' }
  }))
}));

vi.mock('../../src/lib/editor/uploadPipeline.js', () => ({
  processFileUpload: processFileUploadMock,
  fetchUrlAsFile: vi.fn(async (url) => new File(['x'], 'from-url.bin', { type: '' })),
  processUrlUpload: vi.fn(async (url, opts) => {
    const file = new File(['x'], 'from-url.bin', { type: '' });
    return processFileUploadMock(file, opts);
  })
}));

import {
  wireClipboardUpload,
  importFromUrl,
  normalizeCloudUrl,
  apiUpload,
  setupUploadSources
} from '../../src/lib/editor/uploadSources.js';

beforeEach(() => {
  processFileUploadMock.mockClear();
  if (typeof window !== 'undefined') {
    delete window.__apiUpload;
    delete window.__importFromUrl;
  }
});

function makeState() {
  return { tracks: [{ id: 'v1', name: 'Video', items: [] }], assets: [] };
}

function makeImageFile() {
  // Minimal PNG: 8-byte signature
  const png = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  return new File([png], 'pasted.png', { type: 'image/png' });
}

describe('wireClipboardUpload', () => {
  it('wires a paste listener on document', () => {
    const state = makeState();
    const cleanup = wireClipboardUpload({ state });
    expect(typeof cleanup).toBe('function');
    cleanup();
  });

  it('routes clipboard image files through processFileUpload', async () => {
    const state = makeState();
    const file = makeImageFile();
    // Capture the registered handler so we can invoke it directly
    // (jsdom doesn't easily let us fake clipboardData on a dispatched event).
    let capturedHandler = null;
    const origAdd = document.addEventListener.bind(document);
    const spy = vi.spyOn(document, 'addEventListener').mockImplementation((type, fn, opts) => {
      if (type === 'paste') capturedHandler = fn;
      return origAdd(type, fn, opts);
    });
    wireClipboardUpload({ state });
    spy.mockRestore();
    expect(capturedHandler).toBeTypeOf('function');
    const fakeClipboardData = {
      items: [{ kind: 'file', getAsFile: () => file }]
    };
    const event = { clipboardData: fakeClipboardData, preventDefault: vi.fn() };
    await capturedHandler(event);
    expect(processFileUploadMock).toHaveBeenCalled();
  });

  it('does nothing when clipboard has no files', async () => {
    const state = makeState();
    let capturedHandler = null;
    const origAdd = document.addEventListener.bind(document);
    const spy = vi.spyOn(document, 'addEventListener').mockImplementation((type, fn) => {
      if (type === 'paste') capturedHandler = fn;
      return origAdd(type, fn);
    });
    wireClipboardUpload({ state });
    spy.mockRestore();
    await capturedHandler({ clipboardData: { items: [] }, preventDefault: vi.fn() });
    expect(processFileUploadMock).not.toHaveBeenCalled();
  });

  it('does nothing when no state is provided', async () => {
    let capturedHandler = null;
    const origAdd = document.addEventListener.bind(document);
    const spy = vi.spyOn(document, 'addEventListener').mockImplementation((type, fn) => {
      if (type === 'paste') capturedHandler = fn;
      return origAdd(type, fn);
    });
    wireClipboardUpload({});
    spy.mockRestore();
    const file = makeImageFile();
    await capturedHandler({
      clipboardData: { items: [{ kind: 'file', getAsFile: () => file }] },
      preventDefault: vi.fn()
    });
    expect(processFileUploadMock).not.toHaveBeenCalled();
  });

  it('calls onUpload callback for each pasted file', async () => {
    const state = makeState();
    const onUpload = vi.fn();
    let capturedHandler = null;
    const origAdd = document.addEventListener.bind(document);
    const spy = vi.spyOn(document, 'addEventListener').mockImplementation((type, fn) => {
      if (type === 'paste') capturedHandler = fn;
      return origAdd(type, fn);
    });
    wireClipboardUpload({ state, onUpload });
    spy.mockRestore();
    const file1 = makeImageFile();
    const file2 = makeImageFile();
    await capturedHandler({
      clipboardData: {
        items: [
          { kind: 'file', getAsFile: () => file1 },
          { kind: 'file', getAsFile: () => file2 }
        ]
      },
      preventDefault: vi.fn()
    });
    expect(onUpload).toHaveBeenCalled();
    expect(processFileUploadMock).toHaveBeenCalledTimes(2);
  });

  it('cleanup removes the listener', () => {
    const state = makeState();
    const cleanup = wireClipboardUpload({ state });
    cleanup();
    const event = new Event('paste');
    document.dispatchEvent(event);
    return new Promise(r => setTimeout(r, 10)).then(() => {
      expect(processFileUploadMock).not.toHaveBeenCalled();
    });
  });
});

describe('normalizeCloudUrl', () => {
  it('converts Google Drive view URL to direct download', () => {
    const result = normalizeCloudUrl('https://drive.google.com/file/d/ABC123/view');
    expect(result).toContain('uc?export=download');
    expect(result).toContain('ABC123');
  });

  it('converts Dropbox URL to direct download', () => {
    const result = normalizeCloudUrl('https://www.dropbox.com/s/xyz123/file.mp4?dl=0');
    expect(result).toContain('dl=1');
  });

  it('preserves Dropbox URL that already has dl=1', () => {
    const result = normalizeCloudUrl('https://www.dropbox.com/s/xyz123/file.mp4?dl=1');
    expect(result).toContain('dl=1');
  });

  it('returns direct URLs unchanged', () => {
    const url = 'https://example.com/file.mp4';
    expect(normalizeCloudUrl(url)).toBe(url);
  });

  it('returns invalid input as-is', () => {
    expect(normalizeCloudUrl('')).toBe('');
    expect(normalizeCloudUrl(null)).toBe(null);
  });
});

describe('importFromUrl', () => {
  it('routes URL through processFileUpload', async () => {
    const state = makeState();
    const r = await importFromUrl('https://example.com/file.mp4', { state });
    expect(r.success).toBe(true);
    expect(processFileUploadMock).toHaveBeenCalled();
  });

  it('returns error for invalid URL', async () => {
    const r = await importFromUrl('', {});
    expect(r.success).toBe(false);
    expect(r.error).toMatch(/Invalid/i);
  });
});

describe('apiUpload', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('sends file as multipart to the endpoint', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, assetId: 'remote-1' })
    });
    const file = makeImageFile();
    const r = await apiUpload(file, { endpoint: '/api/upload' });
    expect(r.success).toBe(true);
    expect(r.source).toBe('api');
    expect(global.fetch).toHaveBeenCalledWith('/api/upload', expect.objectContaining({
      method: 'POST',
      body: expect.any(FormData)
    }));
  });

  it('falls back to client-side processFileUpload on network error', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network down'));
    const state = makeState();
    const file = makeImageFile();
    const r = await apiUpload(file, { state });
    expect(r.success).toBe(true);
    expect(processFileUploadMock).toHaveBeenCalled();
  });

  it('returns error when no file', async () => {
    const r = await apiUpload(null);
    expect(r.success).toBe(false);
  });
});

describe('setupUploadSources', () => {
  it('wires clipboard + exposes window.__apiUpload + window.__importFromUrl', () => {
    const state = makeState();
    const cleanup = setupUploadSources({ state });
    expect(typeof window.__apiUpload).toBe('function');
    expect(typeof window.__importFromUrl).toBe('function');
    cleanup();
  });

  it('cleanup removes global functions and clipboard listener', () => {
    const state = makeState();
    const cleanup = setupUploadSources({ state });
    cleanup();
    expect(window.__apiUpload).toBeUndefined();
    expect(window.__importFromUrl).toBeUndefined();
  });
});
