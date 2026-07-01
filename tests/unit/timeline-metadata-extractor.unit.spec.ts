import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the libraries used by metadataExtractor
vi.mock('mediainfo.js', () => ({
  default: null,  // constructor not available in test env; the code handles this
}));

vi.mock('music-metadata-browser', () => ({
  parseBlob: vi.fn(async () => ({
    format: {
      duration: 180.5,
      codec: 'MP3',
      bitrate: 320000,
      sampleRate: 44100,
      numberOfChannels: 2,
      container: 'MP3'
    },
    common: {
      title: 'Test Song',
      artist: 'Test Artist',
      album: 'Test Album',
      year: 2024
    }
  }))
}));

vi.mock('exifr', () => ({
  parse: vi.fn(async () => ({
    Orientation: 6,
    ImageWidth: 1920,
    ImageHeight: 1080,
    Make: 'Canon',
    Model: 'EOS R5'
  }))
}));

vi.mock('mp4box', () => ({
  default: {
    createFile: vi.fn(() => null)  // returns null so the fallback path is taken
  }
}));

import {
  extractVideoMetadata,
  extractAudioMetadata,
  extractImageMetadata,
  extractWaveform,
  generateThumbnail,
  extractMetadata
} from '../../src/lib/editor/metadataExtractor.js';

describe('extractVideoMetadata', () => {
  it('returns zeroed defaults for null file', async () => {
    const r = await extractVideoMetadata(null);
    expect(r.duration).toBe(0);
    expect(r.width).toBe(0);
    expect(r.fps).toBe(0);
  });

  it('returns zeroed defaults for empty file', async () => {
    const file = new File([new Uint8Array(0)], 'empty.mp4', { type: 'video/mp4' });
    const r = await extractVideoMetadata(file);
    expect(r.codec).toBe('');
    expect(r.bitrate).toBe(0);
  });
});

describe('extractAudioMetadata', () => {
  it('extracts metadata via music-metadata-browser', async () => {
    const file = new File(['mp3-data'], 'test.mp3', { type: 'audio/mpeg' });
    const r = await extractAudioMetadata(file);
    expect(r.duration).toBe(180.5);
    expect(r.codec).toBe('MP3');
    expect(r.bitrate).toBe(320000);
    expect(r.sampleRate).toBe(44100);
    expect(r.channels).toBe(2);
    expect(r.tags.title).toBe('Test Song');
    expect(r.tags.artist).toBe('Test Artist');
  });

  it('returns zeroed defaults for null file', async () => {
    const r = await extractAudioMetadata(null);
    expect(r.duration).toBe(0);
    expect(r.tags).toEqual({});
  });
});

describe('extractImageMetadata', () => {
  it('extracts EXIF via exifr', async () => {
    const file = new File([new Uint8Array(10)], 'test.jpg', { type: 'image/jpeg' });
    const r = await extractImageMetadata(file);
    expect(r.orientation).toBe(6);
    expect(r.width).toBe(1920);
    expect(r.height).toBe(1080);
    expect(r.rotation).toBe(90);  // orientation 6 → 90 degrees
    expect(r.camera.make).toBe('Canon');
    expect(r.camera.model).toBe('EOS R5');
  });

  it('converts EXIF orientation 3 to 180 rotation', async () => {
    const exifr = await import('exifr');
    exifr.parse.mockResolvedValueOnce({ Orientation: 3 });
    const file = new File([new Uint8Array(10)], 't.jpg', { type: 'image/jpeg' });
    const r = await extractImageMetadata(file);
    expect(r.rotation).toBe(180);
  });

  it('converts EXIF orientation 8 to 270 rotation', async () => {
    const exifr = await import('exifr');
    exifr.parse.mockResolvedValueOnce({ Orientation: 8 });
    const file = new File([new Uint8Array(10)], 't.jpg', { type: 'image/jpeg' });
    const r = await extractImageMetadata(file);
    expect(r.rotation).toBe(270);
  });

  it('returns rotation 0 for orientation 1', async () => {
    const exifr = await import('exifr');
    exifr.parse.mockResolvedValueOnce({ Orientation: 1 });
    const file = new File([new Uint8Array(10)], 't.jpg', { type: 'image/jpeg' });
    const r = await extractImageMetadata(file);
    expect(r.rotation).toBe(0);
  });
});

describe('extractWaveform', () => {
  it('returns empty peaks for null file', async () => {
    const r = await extractWaveform(null);
    expect(r.peaks).toEqual([]);
  });

  it('returns empty peaks when AudioContext is unavailable', async () => {
    const file = new File([new Uint8Array(10)], 'a.mp3', { type: 'audio/mpeg' });
    // jsdom doesn't have AudioContext by default
    const r = await extractWaveform(file);
    expect(r.peaks).toEqual([]);
  });
});

describe('generateThumbnail', () => {
  it('returns null for null file', async () => {
    const r = await generateThumbnail(null, 'image');
    expect(r).toBe(null);
  });

  it('returns null for audio (no visual content)', async () => {
    const file = new File([new Uint8Array(10)], 'a.mp3', { type: 'audio/mpeg' });
    const r = await generateThumbnail(file, 'audio');
    expect(r).toBe(null);
  });
});

describe('extractMetadata (unified)', () => {
  it('routes to audio extractor for audio files', async () => {
    const file = new File([new Uint8Array(10)], 'a.mp3', { type: 'audio/mpeg' });
    const r = await extractMetadata(file, 'audio', { thumbnail: false, waveform: false });
    expect(r.duration).toBe(180.5);
    expect(r.codec).toBe('MP3');
  });

  it('routes to image extractor for image files', async () => {
    const file = new File([new Uint8Array(10)], 'a.jpg', { type: 'image/jpeg' });
    const r = await extractMetadata(file, 'image', { thumbnail: false });
    expect(r.orientation).toBe(6);
  });

  it('routes to video extractor for video files', async () => {
    const file = new File([new Uint8Array(10)], 'a.mp4', { type: 'video/mp4' });
    const r = await extractMetadata(file, 'video', { thumbnail: false });
    expect(r).toBeDefined();
  });

  it('returns safe defaults for null file', async () => {
    const r = await extractMetadata(null, 'video');
    expect(r.duration).toBe(0);
    expect(r.waveform).toBe(null);
    expect(r.thumbnail).toBe(null);
  });
});
