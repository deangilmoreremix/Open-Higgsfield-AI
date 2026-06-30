import { describe, it, expect } from 'vitest';
import {
  ClipSchema,
  LegacyClipSchema,
  TrackSchema,
  AssetSchema,
  ProjectSchema,
  EditorStateSchema,
  UploadMetadataSchema,
  MuAPIResponseSchema,
  GenerationResultSchema,
  GenerationStatusSchema,
  safeValidate,
  validateOrPass,
  validateStrict
} from '../../src/lib/editor/schemas.js';

describe('Zod schemas — clip', () => {
  it('validates a minimal clip', () => {
    const r = ClipSchema.safeParse({ type: 'video', start: 0, end: 5 });
    expect(r.success).toBe(true);
    expect(r.data.start).toBe(0);
    expect(r.data.end).toBe(5);
    expect(r.data.volume).toBe(1);
  });

  it('applies defaults for missing fields', () => {
    const r = ClipSchema.safeParse({});
    expect(r.success).toBe(true);
    expect(r.data.type).toBe('video');
    expect(r.data.start).toBe(0);
    expect(r.data.end).toBe(5);
    expect(r.data.volume).toBe(1);
    expect(r.data.opacity).toBe(1);
  });

  it('rejects negative volume', () => {
    const r = ClipSchema.safeParse({ volume: -1 });
    expect(r.success).toBe(false);
  });

  it('accepts legacy left/width fields', () => {
    const r = ClipSchema.safeParse({ left: 10, width: 20 });
    expect(r.success).toBe(true);
    expect(r.data.left).toBe(10);
    expect(r.data.width).toBe(20);
  });

  it('tolerates unknown fields (passthrough)', () => {
    const r = ClipSchema.safeParse({ type: 'video', start: 0, end: 5, customField: 'hello' });
    expect(r.success).toBe(true);
    expect(r.data.customField).toBe('hello');
  });
});

describe('Zod schemas — legacy clip', () => {
  it('validates a legacy left/width clip', () => {
    const r = LegacyClipSchema.safeParse({ left: 5, width: 12, type: 'video' });
    expect(r.success).toBe(true);
  });
});

describe('Zod schemas — track', () => {
  it('validates a track with items', () => {
    const r = TrackSchema.safeParse({
      id: 'video-1',
      type: 'video',
      name: 'Video',
      items: [{ id: 1, type: 'video', start: 0, end: 5 }]
    });
    expect(r.success).toBe(true);
    expect(r.data.items.length).toBe(1);
  });

  it('applies default name and type', () => {
    const r = TrackSchema.safeParse({});
    expect(r.success).toBe(true);
    expect(r.data.type).toBe('video');
    expect(r.data.name).toBe('Track');
    expect(r.data.muted).toBe(false);
  });

  it('accepts both items and clips (compatibility)', () => {
    const r = TrackSchema.safeParse({
      items: [{ id: 1 }],
      clips: [{ id: 2 }]
    });
    expect(r.success).toBe(true);
  });
});

describe('Zod schemas — asset', () => {
  it('validates an asset', () => {
    const r = AssetSchema.safeParse({
      id: 'asset-1',
      type: 'video',
      name: 'My Video',
      url: 'https://example.com/video.mp4',
      duration: 60
    });
    expect(r.success).toBe(true);
  });

  it('accepts null url (local/pending asset)', () => {
    const r = AssetSchema.safeParse({ url: null });
    expect(r.success).toBe(true);
    expect(r.data.url).toBe(null);
  });
});

describe('Zod schemas — upload metadata', () => {
  it('validates upload result with publicUrl', () => {
    const r = UploadMetadataSchema.safeParse({
      file: new Blob(),
      publicUrl: 'https://example.com/uploaded.mp4',
      size: 1024,
      duration: 30
    });
    expect(r.success).toBe(true);
  });
});

describe('Zod schemas — project', () => {
  it('validates a project with tracks and assets', () => {
    const r = ProjectSchema.safeParse({
      fps: 30,
      duration: 60,
      tracks: [{ id: 't1', type: 'video', name: 'V', items: [] }],
      assets: [{ id: 'a1', type: 'video', name: 'A' }]
    });
    expect(r.success).toBe(true);
  });

  it('rejects fps > 240', () => {
    const r = ProjectSchema.safeParse({ fps: 300 });
    expect(r.success).toBe(false);
  });
});

describe('Zod schemas — editor state', () => {
  it('validates a full editor state', () => {
    const r = EditorStateSchema.safeParse({
      projectTitle: 'My Project',
      playheadPercent: 50,
      playing: true,
      selectedTool: 'Select'
    });
    expect(r.success).toBe(true);
    expect(r.data.projectTitle).toBe('My Project');
    expect(r.data.playheadPercent).toBe(50);
    expect(r.data.snapEnabled).toBe(true);
  });

  it('rejects out-of-range playhead', () => {
    const r = EditorStateSchema.safeParse({ playheadPercent: 150 });
    expect(r.success).toBe(false);
  });

  it('rejects out-of-range zoom', () => {
    const r = EditorStateSchema.safeParse({ zoom: 0 });
    expect(r.success).toBe(false);
  });
});

describe('Zod schemas — MuAPI responses', () => {
  it('validates a base MuAPI response', () => {
    const r = MuAPIResponseSchema.safeParse({
      success: true,
      status: 'ok',
      data: { id: 1 }
    });
    expect(r.success).toBe(true);
  });

  it('validates a generation result', () => {
    const r = GenerationResultSchema.safeParse({
      generationId: 'gen_123',
      status: 'processing',
      previewUrl: 'https://example.com/preview.mp4'
    });
    expect(r.success).toBe(true);
  });

  it('rejects generation result without id', () => {
    const r = GenerationResultSchema.safeParse({ status: 'processing' });
    expect(r.success).toBe(false);
  });

  it('rejects invalid generation status', () => {
    const r = GenerationResultSchema.safeParse({
      generationId: 'gen_1',
      status: 'flying'
    });
    expect(r.success).toBe(false);
  });

  it('validates generation status with progress', () => {
    const r = GenerationStatusSchema.safeParse({
      generationId: 'gen_1',
      status: 'processing',
      progress: 42.5
    });
    expect(r.success).toBe(true);
  });
});

describe('Validation helpers', () => {
  it('safeValidate returns success for valid data', () => {
    const r = safeValidate(ClipSchema, { type: 'video', start: 0, end: 5 });
    expect(r.success).toBe(true);
    expect(r.data.type).toBe('video');
  });

  it('safeValidate returns errors for invalid data', () => {
    const r = safeValidate(ClipSchema, { volume: -5 });
    expect(r.success).toBe(false);
    expect(r.errors.length).toBeGreaterThan(0);
    expect(r.errors[0].path).toBe('volume');
  });

  it('validateOrPass returns parsed data on success', () => {
    const r = validateOrPass(ClipSchema, { type: 'audio' }, 'test');
    expect(r.type).toBe('audio');
  });

  it('validateOrPass returns original data on failure (permissive)', () => {
    const bad = { volume: -99 };
    const r = validateOrPass(ClipSchema, bad, 'test');
    expect(r).toBe(bad);
  });

  it('validateOrPass returns null/undefined as-is', () => {
    expect(validateOrPass(ClipSchema, null, 'test')).toBe(null);
    expect(validateOrPass(ClipSchema, undefined, 'test')).toBe(undefined);
  });

  it('validateStrict throws on invalid data', () => {
    expect(() => validateStrict(ClipSchema, { volume: -5 }, 'test')).toThrow();
  });

  it('validateStrict returns parsed data on success', () => {
    const r = validateStrict(ClipSchema, { type: 'video' }, 'test');
    expect(r.type).toBe('video');
    expect(r.volume).toBe(1);
  });
});
