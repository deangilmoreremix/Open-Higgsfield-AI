import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the Supabase upload before importing the pipeline
vi.mock('../../src/lib/hybrid-supabase.js', () => ({
  uploadFileToStorage: vi.fn(async (file) => {
    return `https://example.com/uploads/${encodeURIComponent(file.name || 'file')}`;
  })
}));

vi.mock('../../src/lib/media-worker-manager.js', () => ({
  mediaWorker: {
    getMediaDuration: vi.fn(async () => 30),
    getImageDimensions: vi.fn(async () => ({ width: 1920, height: 1080 }))
  }
}));

import {
  processFileUpload,
  processMultipleFileUploads,
  buildAsset,
  buildClipFromAsset,
  insertAssetIntoTimeline,
  readMetadata,
  generateThumbnail,
  createAssetFromFile,
  addAssetToTimeline,
  validateFile
} from '../../src/lib/editor/uploadPipeline.js';

function makeFile(name, type, content = 'data') {
  const f = new File([content], name, { type });
  return f;
}

function makeState(overrides = {}) {
  return {
    projectTitle: 'Test',
    tracks: [
      { id: 'video-1', name: 'Video', type: 'video', items: [], muted: false, solo: false, locked: false, visible: true, height: 80, color: '#3b82f6' },
      { id: 'audio-1', name: 'Audio', type: 'audio', items: [], muted: false, solo: false, locked: false, visible: true, height: 60, color: '#10b981' },
      { id: 'text-1', name: 'Text', type: 'text', items: [], muted: false, solo: false, locked: false, visible: true, height: 50, color: '#f59e0b' }
    ],
    assets: [],
    mediaLibrary: [],
    undoStack: [],
    redoStack: [],
    timelineSeconds: 60,
    selectedClipId: null,
    ...overrides
  };
}

describe('UploadPipeline — buildAsset', () => {
  it('builds a canonical asset', () => {
    const file = makeFile('a.mp4', 'video/mp4');
    const asset = buildAsset({
      file, type: 'video', publicUrl: 'https://x/a.mp4', meta: { duration: 30 }, thumbnail: 'data:image/png;base64,'
    });
    expect(asset.id).toMatch(/^asset_/);
    expect(asset.type).toBe('video');
    expect(asset.url).toBe('https://x/a.mp4');
    expect(asset.duration).toBe(30);
    expect(asset.thumbnail).toMatch(/^data:/);
    expect(asset.uploadedAt).toBeDefined();
  });

  it('omits optional metadata fields when not provided', () => {
    const file = makeFile('a.txt', 'text/plain');
    const asset = buildAsset({ file, type: 'text', publicUrl: 'https://x/a.txt', meta: {}, thumbnail: null });
    expect(asset.duration).toBe(0);
    expect(asset.thumbnail).toBe(null);
  });
});

describe('UploadPipeline — buildClipFromAsset', () => {
  it('builds a clip with start/end/assetId', () => {
    const file = makeFile('a.mp4', 'video/mp4');
    const asset = buildAsset({ file, type: 'video', publicUrl: 'https://x/a.mp4', meta: { duration: 30 }, thumbnail: null });
    const clip = buildClipFromAsset(asset, 0, 30);
    expect(clip.id).toMatch(/^clip_/);
    expect(clip.assetId).toBe(asset.id);
    expect(clip.type).toBe('video');
    expect(clip.start).toBe(0);
    expect(clip.end).toBe(30);
    expect(clip.sourceStart).toBe(0);
    expect(clip.sourceEnd).toBe(30);
  });

  it('uses start=end-0.1 minimum when duration is 0', () => {
    const file = makeFile('a.png', 'image/png');
    const asset = buildAsset({ file, type: 'image', publicUrl: 'https://x/a.png', meta: {}, thumbnail: null });
    const clip = buildClipFromAsset(asset, 5, 5);
    // 0.1 in IEEE 754 is 0.1000000000000000055...; allow small float drift
    expect(clip.end - clip.start).toBeGreaterThanOrEqual(0.099);
  });
});

describe('UploadPipeline — insertAssetIntoTimeline', () => {
  it('inserts into the correct track by type', () => {
    const state = makeState();
    const file = makeFile('a.mp4', 'video/mp4');
    const asset = buildAsset({ file, type: 'video', publicUrl: 'https://x/a.mp4', meta: { duration: 30 }, thumbnail: null });
    const { track, clip } = insertAssetIntoTimeline(state, asset, {});
    expect(track.name).toBe('Video');
    expect(track.items).toContain(clip);
    expect(state.selectedClipId).toBe(clip.id);
  });

  it('appends to end of track when no dropPercent given', () => {
    const state = makeState();
    state.tracks[0].items.push({ id: 'existing', start: 0, end: 10, type: 'video' });
    const file = makeFile('a.mp4', 'video/mp4');
    const asset = buildAsset({ file, type: 'video', publicUrl: 'https://x/a.mp4', meta: { duration: 5 }, thumbnail: null });
    const { clip } = insertAssetIntoTimeline(state, asset, {});
    expect(clip.start).toBe(10);
    expect(clip.end).toBe(15);
  });

  it('uses dropPercent for position', () => {
    const state = makeState();
    const file = makeFile('a.mp4', 'video/mp4');
    const asset = buildAsset({ file, type: 'video', publicUrl: 'https://x/a.mp4', meta: { duration: 5 }, thumbnail: null });
    const { clip } = insertAssetIntoTimeline(state, asset, { dropPercent: 50 });
    expect(clip.start).toBe(30);
    expect(clip.end).toBe(35);
  });

  it('creates a new track when none matches', () => {
    const state = makeState({ tracks: [] });
    const file = makeFile('a.mp4', 'video/mp4');
    const asset = buildAsset({ file, type: 'video', publicUrl: 'https://x/a.mp4', meta: { duration: 5 }, thumbnail: null });
    const { track } = insertAssetIntoTimeline(state, asset, {});
    expect(state.tracks.length).toBe(1);
    expect(track.items.length).toBe(1);
  });

  it('routes audio to Audio track', () => {
    const state = makeState();
    const file = makeFile('a.mp3', 'audio/mpeg');
    const asset = buildAsset({ file, type: 'audio', publicUrl: 'https://x/a.mp3', meta: { duration: 5 }, thumbnail: null });
    const { track } = insertAssetIntoTimeline(state, asset, {});
    expect(track.name).toBe('Audio');
  });

  it('routes image to Text track (per design)', () => {
    const state = makeState();
    const file = makeFile('a.png', 'image/png');
    const asset = buildAsset({ file, type: 'image', publicUrl: 'https://x/a.png', meta: {}, thumbnail: null });
    const { track } = insertAssetIntoTimeline(state, asset, {});
    expect(track.name).toBe('Text');
  });
});

describe('UploadPipeline — processFileUpload (full pipeline)', () => {
  it('validates, uploads, creates asset, inserts clip, saves', async () => {
    const state = makeState();
    const file = makeFile('a.mp4', 'video/mp4');
    const r = await processFileUpload(file, { state, save: false });
    expect(r.success).toBe(true);
    expect(r.asset).toBeDefined();
    expect(r.clip).toBeDefined();
    expect(r.track).toBeDefined();
    expect(state.assets.length).toBe(1);
    expect(state.mediaLibrary.length).toBe(1);
    expect(state.tracks[0].items.length).toBe(1);
  });

  it('rejects unsupported file types', async () => {
    const state = makeState();
    const file = makeFile('a.xyz', '', 'x');
    const r = await processFileUpload(file, { state, save: false });
    expect(r.success).toBe(false);
    expect(r.error).toMatch(/Unsupported/i);
  });

  it('returns error when no file provided', async () => {
    const state = makeState();
    const r = await processFileUpload(null, { state, save: false });
    expect(r.success).toBe(false);
  });

  it('returns error when no state provided', async () => {
    const file = makeFile('a.mp4', 'video/mp4');
    const r = await processFileUpload(file, { save: false });
    expect(r.success).toBe(false);
    expect(r.error).toMatch(/No state/i);
  });

  it('rejects oversized files', async () => {
    const state = makeState();
    const file = makeFile('big.mp4', 'video/mp4');
    Object.defineProperty(file, 'size', { value: 600 * 1024 * 1024, configurable: true });
    const r = await processFileUpload(file, { state, save: false });
    expect(r.success).toBe(false);
    expect(r.error).toMatch(/too large/i);
  });

  it('pushes undo snapshot by default', async () => {
    const state = makeState();
    const file = makeFile('a.mp4', 'video/mp4');
    await processFileUpload(file, { state, save: false });
    expect(state.undoStack.length).toBe(1);
  });

  it('skips undo snapshot when opts.undoSnapshot=false', async () => {
    const state = makeState();
    const file = makeFile('a.mp4', 'video/mp4');
    await processFileUpload(file, { state, save: false, undoSnapshot: false });
    expect(state.undoStack.length).toBe(0);
  });

  it('calls renderTracks callback', async () => {
    const state = makeState();
    const file = makeFile('a.mp4', 'video/mp4');
    const renderTracks = vi.fn();
    await processFileUpload(file, { state, save: false, renderTracks });
    expect(renderTracks).toHaveBeenCalled();
  });

  it('calls showToast on success', async () => {
    const state = makeState();
    const file = makeFile('a.mp4', 'video/mp4');
    const showToast = vi.fn();
    await processFileUpload(file, { state, save: false, showToast });
    expect(showToast).toHaveBeenCalled();
    expect(showToast.mock.calls[0][0]).toMatch(/Added/);
  });

  it('calls showToast with error on validation failure', async () => {
    const state = makeState();
    const file = makeFile('a.xyz', '', 'x');
    const showToast = vi.fn();
    await processFileUpload(file, { state, save: false, showToast });
    expect(showToast).toHaveBeenCalled();
    expect(showToast.mock.calls[0][1]).toBe('error');
  });
});

describe('UploadPipeline — processMultipleFileUploads', () => {
  it('processes all files and returns results array', async () => {
    const state = makeState();
    const files = [
      makeFile('a.mp4', 'video/mp4'),
      makeFile('b.mp3', 'audio/mpeg'),
      makeFile('c.png', 'image/png')
    ];
    const results = await processMultipleFileUploads(files, { state, save: false });
    expect(results.length).toBe(3);
    expect(results.every(r => r.success)).toBe(true);
    expect(state.assets.length).toBe(3);
  });
});

describe('UploadPipeline — legacy compatibility', () => {
  it('createAssetFromFile returns asset and mutates state.assets', async () => {
    const state = makeState();
    const file = makeFile('a.mp4', 'video/mp4');
    const asset = await createAssetFromFile(file, 'video', 'https://x/a.mp4', state);
    expect(asset.id).toBeDefined();
    expect(state.assets[0]).toBe(asset);
  });

  it('addAssetToTimeline inserts via insertAssetIntoTimeline', async () => {
    const state = makeState();
    const file = makeFile('a.mp4', 'video/mp4');
    const asset = await createAssetFromFile(file, 'video', 'https://x/a.mp4', state);
    const r = await addAssetToTimeline(asset, 'video', state);
    expect(r.track.name).toBe('Video');
    expect(r.clip.type).toBe('video');
  });
});

describe('UploadPipeline — readMetadata', () => {
  it('returns duration for video files', async () => {
    const file = makeFile('a.mp4', 'video/mp4');
    const meta = await readMetadata(file, 'video');
    expect(meta.duration).toBe(30); // mocked
  });

  it('returns dimensions for image files', async () => {
    const file = makeFile('a.png', 'image/png');
    const meta = await readMetadata(file, 'image');
    expect(meta.width).toBe(1920);
    expect(meta.height).toBe(1080);
  });

  it('returns zeroed object on null file', async () => {
    const meta = await readMetadata(null, 'video');
    // readMetadata now delegates to extractMetadata which returns zeroed fields
    expect(meta.duration).toBe(0);
    expect(meta.width).toBe(0);
  });
});

describe('UploadPipeline — re-exports', () => {
  it('re-exports validateFile', () => {
    expect(typeof validateFile).toBe('function');
  });
});
