/**
 * Metadata Extractor
 *
 * Extracts production-quality metadata from uploaded files using
 * dedicated libraries for each format:
 *
 *   - mediainfo.js    — codec, fps, bitrate, container (video/audio)
 *   - exifr            — EXIF orientation, camera, GPS (images)
 *   - music-metadata-browser — sample rate, channels, bitrate, tags (audio)
 *   - mp4box           — MP4 box parsing, tracks, duration (video)
 *
 * Also generates:
 *   - thumbnails (first frame for video, embedded preview for image)
 *   - waveforms (audio peak data for timeline rendering)
 *   - rotation (from EXIF or video track rotation)
 *
 * All functions are tolerant: if a library fails or the format doesn't
 * match, the function returns whatever it could extract and fills the
 * rest with safe defaults.
 */

import { mediaWorker } from '../media-worker-manager.js';

// ============================================================================
// VIDEO: mediainfo.js + mp4box
// ============================================================================

/**
 * Extract video metadata using mediainfo.js and (for MP4) mp4box.
 * Returns { duration, width, height, fps, codec, bitrate, container, rotation }.
 */
export async function extractVideoMetadata(file) {
  const result = {
    duration: 0,
    width: 0,
    height: 0,
    fps: 0,
    codec: '',
    bitrate: 0,
    container: '',
    rotation: 0
  };

  if (!file) return result;

  // 1. mediainfo.js — codec, fps, bitrate, container
  try {
    const mediainfo = await import('mediainfo.js');
    const MediaInfo = mediainfo.default || mediainfo.MediaInfo || mediainfo;
    if (typeof MediaInfo === 'function') {
      const mi = await MediaInfo({ format: 'object' });
      const getSize = () => file.size;
      const readChunk = async (offset, length) => {
        const slice = file.slice(offset, offset + length);
        const ab = await slice.arrayBuffer();
        return new Uint8Array(ab);
      };
      try {
        const metadata = await mi.analyzeData(getSize, readChunk);
        if (metadata && metadata.media && metadata.media.track) {
          for (const track of metadata.media.track) {
            if (track['@type'] === 'General') {
              if (track.Duration) result.duration = parseFloat(track.Duration) / 1000;
              if (track.OverallBitRate) result.bitrate = parseInt(track.OverallBitRate, 10);
              if (track.Format) result.container = String(track.Format);
            } else if (track['@type'] === 'Video') {
              if (track.Width) result.width = parseInt(track.Width, 10);
              if (track.Height) result.height = parseInt(track.Height, 10);
              if (track.FrameRate) result.fps = parseFloat(track.FrameRate);
              if (track.Format) result.codec = String(track.Format);
              if (track.Rotation) result.rotation = parseFloat(track.Rotation);
            } else if (track['@type'] === 'Audio') {
              if (!result.duration && track.Duration) result.duration = parseFloat(track.Duration) / 1000;
              if (track.Format) result.codec = result.codec || String(track.Format);
              if (track.BitRate) result.bitrate = parseInt(track.BitRate, 10);
            }
          }
        }
        try { mi.close(); } catch (e) { /* best-effort */ }
      } catch (e) {
        // mediainfo failed for this file; continue
      }
    }
  } catch (e) {
    // mediainfo not available
  }

  // 2. mp4box — for MP4 files, get tracks and duration
  if (!result.duration || !result.width) {
    try {
      const MP4Box = (await import('mp4box')).default || (await import('mp4box'));
      if (MP4Box && MP4Box.createFile) {
        const mp4 = MP4Box.createFile();
        const arrayBuffer = await file.arrayBuffer();
        const buffer = arrayBuffer.slice(arrayBuffer.byteLength - 1024);  // last 1KB for moov
        buffer.fileStart = arrayBuffer.byteLength - 1024;
        mp4.appendBuffer(buffer);
        mp4.flush();
        if (mp4.info) {
          if (!result.duration && mp4.info.duration) {
            result.duration = mp4.info.duration / mp4.info.timescale;
          }
          if (mp4.info.tracks) {
            for (const track of mp4.info.tracks) {
              if (track.video) {
                if (!result.width) result.width = track.video.width;
                if (!result.height) result.height = track.video.height;
                if (!result.fps && track.video.timescale) {
                  result.fps = track.video.nb_samples / (track.video.samples_duration / track.video.timescale);
                }
                if (!result.codec) result.codec = track.codec || 'avc1';
              }
            }
          }
        }
      }
    } catch (e) {
      // mp4box not available or file is not MP4
    }
  }

  // 3. Fallback: use mediaWorker for duration
  if (!result.duration) {
    try {
      const dur = await mediaWorker.getMediaDuration?.(file);
      if (typeof dur === 'number' && Number.isFinite(dur)) {
        result.duration = dur;
      }
    } catch (e) { /* best-effort */ }
  }

  return result;
}

// ============================================================================
// AUDIO: music-metadata-browser
// ============================================================================

/**
 * Extract audio metadata using music-metadata-browser.
 * Returns { duration, codec, bitrate, sampleRate, channels, tags }.
 */
export async function extractAudioMetadata(file) {
  const result = {
    duration: 0,
    codec: '',
    bitrate: 0,
    sampleRate: 0,
    channels: 0,
    tags: {}
  };

  if (!file) return result;

  try {
    const mmModule = await import('music-metadata-browser');
    const parseBlob = mmModule.parseBlob || (mmModule.default && mmModule.default.parseBlob);
    if (typeof parseBlob === 'function') {
      const metadata = await parseBlob(file);
      if (metadata) {
        if (metadata.format) {
          if (metadata.format.duration) result.duration = metadata.format.duration;
          if (metadata.format.codec) result.codec = String(metadata.format.codec);
          if (metadata.format.bitrate) result.bitrate = metadata.format.bitrate;
          if (metadata.format.sampleRate) result.sampleRate = metadata.format.sampleRate;
          if (metadata.format.numberOfChannels) result.channels = metadata.format.numberOfChannels;
          if (!result.container && metadata.format.container) {
            result.container = String(metadata.format.container);
          }
        }
        if (metadata.common) {
          result.tags = {
            title: metadata.common.title || '',
            artist: metadata.common.artist || '',
            album: metadata.common.album || '',
            year: metadata.common.year || null,
            genre: metadata.common.genre?.[0] || ''
          };
        }
      }
    }
  } catch (e) {
    // music-metadata failed
  }

  // Fallback duration
  if (!result.duration) {
    try {
      const dur = await mediaWorker.getMediaDuration?.(file);
      if (typeof dur === 'number' && Number.isFinite(dur)) {
        result.duration = dur;
      }
    } catch (e) { /* best-effort */ }
  }

  return result;
}

// ============================================================================
// IMAGE: exifr + dimensions
// ============================================================================

/**
 * Extract image metadata using exifr.
 * Returns { width, height, orientation, camera, gps, exif }.
 */
export async function extractImageMetadata(file) {
  const result = {
    width: 0,
    height: 0,
    orientation: 1,
    rotation: 0,
    camera: null,
    gps: null,
    exif: {}
  };

  if (!file) return result;

  // 1. exifr — EXIF tags including orientation
  try {
    const exifrModule = await import('exifr');
    const parse = exifrModule.parse || (exifrModule.default && exifrModule.default.parse);
    if (typeof parse === 'function') {
      const exif = await parse(file, { gps: true, tiff: true, exif: true, ifd0: true });
      if (exif) {
        if (exif.Orientation) result.orientation = exif.Orientation;
        if (exif.ImageWidth) result.width = exif.ImageWidth;
        if (exif.ImageHeight) result.height = exif.ImageHeight;
        if (exif.Make || exif.Model) {
          result.camera = { make: exif.Make || '', model: exif.Model || '' };
        }
        if (exif.latitude || exif.longitude) {
          result.gps = { lat: exif.latitude, lng: exif.longitude };
        }
        result.exif = exif;
      }
    }
  } catch (e) {
    // exifr failed
  }

  // 2. Fallback dimensions
  if (!result.width || !result.height) {
    try {
      const dims = await mediaWorker.getImageDimensions?.(file);
      if (dims) {
        if (!result.width) result.width = dims.width;
        if (!result.height) result.height = dims.height;
      }
    } catch (e) { /* best-effort */ }
  }

  // 3. Convert orientation to rotation degrees
  // EXIF orientation values: 1=normal, 3=180, 6=90 CW, 8=270 CW
  const ORIENT_TO_ROT = { 1: 0, 3: 180, 6: 90, 8: 270, 2: 0, 4: 180, 5: 90, 7: 270 };
  if (result.orientation in ORIENT_TO_ROT) {
    result.rotation = ORIENT_TO_ROT[result.orientation];
  }

  return result;
}

// ============================================================================
// WAVEFORMS (audio peak data for timeline rendering)
// ============================================================================

/**
 * Decode an audio file and return downsampled peak data (waveform).
 * Returns { peaks: number[], sampleRate, duration, channels }.
 *
 * Uses Web Audio API to decode the file, then downsamples to a target
 * number of peak points (default 1000).
 */
export async function extractWaveform(file, options = {}) {
  const targetPoints = options.targetPoints || 1000;
  const result = {
    peaks: [],
    sampleRate: 0,
    duration: 0,
    channels: 0
  };

  if (!file) return result;
  if (typeof window === 'undefined' || typeof AudioContext === 'undefined' && typeof webkitAudioContext === 'undefined') {
    return result;
  }

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const arrayBuffer = await file.arrayBuffer();
    const ctx = new AudioCtx();
    let audioBuffer;
    try {
      audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
    } finally {
      try { ctx.close(); } catch (e) { /* best-effort */ }
    }
    if (!audioBuffer) return result;

    result.sampleRate = audioBuffer.sampleRate;
    result.duration = audioBuffer.duration;
    result.channels = audioBuffer.numberOfChannels;

    // Mix down to mono and downsample to targetPoints
    const numSamples = audioBuffer.length;
    const samplesPerPoint = Math.max(1, Math.floor(numSamples / targetPoints));
    const peaks = new Array(targetPoints).fill(0);

    const channelData = [];
    for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
      channelData.push(audioBuffer.getChannelData(c));
    }

    for (let p = 0; p < targetPoints; p++) {
      const start = p * samplesPerPoint;
      const end = Math.min(start + samplesPerPoint, numSamples);
      let max = 0;
      for (let i = start; i < end; i++) {
        let sum = 0;
        for (let c = 0; c < channelData.length; c++) {
          sum += Math.abs(channelData[c][i] || 0);
        }
        const v = sum / channelData.length;
        if (v > max) max = v;
      }
      peaks[p] = Math.min(1, max);
    }
    result.peaks = peaks;
  } catch (e) {
    // Audio decode failed
  }

  return result;
}

// ============================================================================
// THUMBNAILS
// ============================================================================

/**
 * Generate a thumbnail for a file. For images, returns a small data URL.
 * For videos, captures the first frame as a data URL.
 * For audio, returns null (no visual content).
 */
export async function generateThumbnail(file, type, options = {}) {
  const maxWidth = options.maxWidth || 320;
  const maxHeight = options.maxHeight || 180;
  const quality = options.quality || 0.7;

  if (!file) return null;
  if (type === 'image') {
    return await generateImageThumbnail(file, maxWidth, maxHeight, quality);
  }
  if (type === 'video') {
    return await generateVideoThumbnail(file, maxWidth, maxHeight, quality);
  }
  return null;
}

function generateImageThumbnail(file, maxWidth, maxHeight, quality) {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') { resolve(null); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    let resolved = false;
    const cleanup = () => { URL.revokeObjectURL(url); };
    img.onload = () => {
      try {
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
        if (h > maxHeight) { w = (maxHeight / h) * w; h = maxHeight; }
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, w);
        canvas.height = Math.max(1, h);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          if (!resolved) { resolved = true; resolve(canvas.toDataURL('image/jpeg', quality)); }
        }
      } catch (e) { /* ignored */ }
      cleanup();
    };
    img.onerror = () => { if (!resolved) { resolved = true; resolve(null); } cleanup(); };
    setTimeout(() => { if (!resolved) { resolved = true; resolve(null); } cleanup(); }, 5000);
    img.src = url;
  });
}

function generateVideoThumbnail(file, maxWidth, maxHeight, quality) {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') { resolve(null); return; }
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.src = url;
    let resolved = false;
    const cleanup = () => { URL.revokeObjectURL(url); video.remove(); };
    video.addEventListener('loadedmetadata', () => {
      video.currentTime = Math.min(0.1, (video.duration || 1) * 0.1);
    });
    video.addEventListener('seeked', () => {
      try {
        let w = video.videoWidth, h = video.videoHeight;
        if (!w || !h) { if (!resolved) { resolved = true; resolve(null); } cleanup(); return; }
        if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
        if (h > maxHeight) { w = (maxHeight / h) * w; h = maxHeight; }
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, w);
        canvas.height = Math.max(1, h);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          if (!resolved) { resolved = true; resolve(canvas.toDataURL('image/jpeg', quality)); }
        }
      } catch (e) { /* ignored */ }
      cleanup();
    });
    video.addEventListener('error', () => { if (!resolved) { resolved = true; resolve(null); } cleanup(); });
    setTimeout(() => { if (!resolved) { resolved = true; resolve(null); } cleanup(); }, 8000);
  });
}

// ============================================================================
// UNIFIED ENTRY
// ============================================================================

/**
 * Extract all available metadata for a file. Routes to the right
 * extractor based on file type.
 *
 * @param {File|Blob} file
 * @param {string} type - 'video' | 'audio' | 'image' | 'text'
 * @param {Object} [options]
 * @returns {Promise<Object>} Normalized metadata object
 */
export async function extractMetadata(file, type, options = {}) {
  const result = {
    duration: 0,
    width: 0,
    height: 0,
    fps: 0,
    codec: '',
    bitrate: 0,
    sampleRate: 0,
    channels: 0,
    container: '',
    rotation: 0,
    orientation: 1,
    camera: null,
    gps: null,
    tags: {},
    waveform: null,
    thumbnail: null
  };

  if (!file) return result;

  try {
    if (type === 'video') {
      const v = await extractVideoMetadata(file);
      Object.assign(result, v);
    } else if (type === 'audio') {
      const a = await extractAudioMetadata(file);
      Object.assign(result, a);
    } else if (type === 'image') {
      const i = await extractImageMetadata(file);
      Object.assign(result, i);
    }

    if (type === 'audio' && options.waveform !== false) {
      const w = await extractWaveform(file, { targetPoints: options.waveformPoints || 1000 });
      result.waveform = w.peaks.length > 0 ? w : null;
      if (w.sampleRate) result.sampleRate = w.sampleRate;
      if (w.channels) result.channels = w.channels;
      if (w.duration && !result.duration) result.duration = w.duration;
    }

    if (options.thumbnail !== false && (type === 'video' || type === 'image')) {
      result.thumbnail = await generateThumbnail(file, type, options);
    }
  } catch (e) {
    // Best-effort; return whatever was extracted
  }

  return result;
}
