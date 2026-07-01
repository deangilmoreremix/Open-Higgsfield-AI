/**
 * Unified File Upload Pipeline
 *
 * Single entry point for every file upload source:
 *   - Upload button (file input change)
 *   - Desktop drag onto timeline / media library / global
 *   - Clipboard paste
 *   - Cloud import
 *   - Programmatic / API upload
 *
 * Steps (per the production spec):
 *   1. Validate (magic bytes via file-type, then MIME, then extension)
 *   2. Read metadata (duration, dimensions, codec)
 *   3. Upload (to Supabase Storage via hybridSupabase)
 *   4. Create asset (real asset object with metadata)
 *   5. Generate thumbnail (for video / image)
 *   6. Insert into timeline (track.items, with track.clips alias)
 *   7. Save (via persistence.saveProject)
 *   8. Undo snapshot (via TimelineState snapshot stack)
 *   9. Refresh UI (re-render tracks, show toast)
 *
 * No duplicate upload logic anywhere — every entry point calls this.
 *
 * Backwards compatible: existing functions that already do partial
 * uploads (handleUpload, addAssetToTimeline) are kept and now delegate
 * to processFileUpload.
 */

import { validateFile as validateFileImpl } from './validateFile.js';
import { uploadFileToStorage } from '../hybrid-supabase.js';
import { mediaWorker } from '../media-worker-manager.js';
import { saveProject } from './persistence.js';
import { validateOrPass } from './schemas.js';
import { extractMetadata as extractMetadataImpl, generateThumbnail as generateThumbnailImpl, extractWaveform as extractWaveformImpl } from './metadataExtractor.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_OPTIONS = {
  dropZone: null,         // 'media-library' | 'timeline' | track-id | null
  state: null,            // editor state object (required)
  showToast: null,        // optional toast function
  save: true,             // persist after insert
  thumbnail: true,        // generate thumbnail (video / image)
  undoSnapshot: true,     // push undo snapshot
  renderTracks: null,     // optional callback to re-render tracks
  skipValidation: false   // for internal callers that already validated
};

// ============================================================================
// METADATA EXTRACTION
// ============================================================================

/**
 * Extract real metadata from a file. Uses mediaWorker for video/image/audio.
 * Returns { duration, width, height, codec, fps, bitrate, channels, ... }.
 */
export async function readMetadata(file, type) {
  // Delegate to the production metadata extractor (mediainfo.js, exifr,
  // music-metadata-browser, mp4box) and return only the basic fields
  // for backwards compatibility.
  const full = await extractMetadataImpl(file, type, { thumbnail: false, waveform: false });
  // Return the legacy shape (duration, width, height, etc.)
  return {
    duration: full.duration,
    width: full.width,
    height: full.height,
    fps: full.fps,
    codec: full.codec,
    bitrate: full.bitrate,
    sampleRate: full.sampleRate,
    channels: full.channels,
    container: full.container,
    rotation: full.rotation
  };
}

// ============================================================================
// THUMBNAIL GENERATION
// ============================================================================

/**
 * Generate a thumbnail for a video or image file. Returns a data URL
 * (for images) or a blob URL (for video frame). Returns null on failure.
 *
 * For images: reads the file and returns a data URL.
 * For videos: captures the first frame using a video element + canvas.
 */
export async function generateThumbnail(file, type) {
  if (!file) return null;
  try {
    if (type === 'image') {
      return await readAsDataURL(file);
    }
    if (type === 'video') {
      return await captureVideoFirstFrame(file);
    }
  } catch (e) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[UploadPipeline] generateThumbnail failed:', e);
    }
  }
  return null;
}

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function captureVideoFirstFrame(file) {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') { resolve(null); return; }
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.src = url;
    let resolved = false;
    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.remove();
    };
    video.addEventListener('loadedmetadata', () => {
      // Seek to a small offset to avoid black first frame
      video.currentTime = Math.min(0.1, (video.duration || 1) * 0.1);
    });
    video.addEventListener('seeked', () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 180;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          if (!resolved) { resolved = true; resolve(dataUrl); }
        }
      } catch (e) { /* ignored */ }
      cleanup();
    });
    video.addEventListener('error', () => { if (!resolved) { resolved = true; resolve(null); } cleanup(); });
    setTimeout(() => { if (!resolved) { resolved = true; resolve(null); } cleanup(); }, 5000);
  });
}

// ============================================================================
// ASSET CREATION
// ============================================================================

function newId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Build the canonical asset object for a newly uploaded file.
 */
export function buildAsset({ file, type, publicUrl, meta, thumbnail }) {
  return {
    id: newId('asset'),
    type,
    name: file.name || 'Untitled',
    url: publicUrl,
    size: file.size,
    mimeType: file.type || '',
    source: 'upload',
    uploadedAt: new Date().toISOString(),
    duration: meta.duration || 0,
    width: meta.width || null,
    height: meta.height || null,
    thumbnail: thumbnail || null,
    metadata: {
      ...(meta.codec ? { codec: meta.codec } : {}),
      ...(meta.fps ? { fps: meta.fps } : {}),
      ...(meta.bitrate ? { bitrate: meta.bitrate } : {}),
      ...(meta.channels ? { channels: meta.channels } : {}),
      ...(meta.sampleRate ? { sampleRate: meta.sampleRate } : {})
    }
  };
}

// ============================================================================
// TIMELINE INSERTION
// ============================================================================

const TRACK_TYPE_BY_CATEGORY = {
  video: 'Video',
  audio: 'Audio',
  image: 'Text',       // images go to Text track by default (renders in title lane)
  text: 'Text',
  document: 'Text'
};

/**
 * Find the best track for a given asset type. Falls back to creating
 * a new track if none matches.
 */
function findOrCreateTrack(state, category) {
  const preferredName = TRACK_TYPE_BY_CATEGORY[category] || 'Video';
  let track = (state.tracks || []).find(t => t.name === preferredName);
  if (!track) {
    track = (state.tracks || []).find(t => t.type === category);
  }
  if (!track && (state.tracks || []).length > 0) {
    track = state.tracks[0];
  }
  if (!track) {
    // No tracks at all — create one
    track = {
      id: newId('track'),
      type: category,
      name: preferredName,
      muted: false,
      solo: false,
      locked: false,
      visible: true,
      height: 60,
      color: '#3b82f6',
      items: []
    };
    state.tracks = state.tracks || [];
    state.tracks.push(track);
  }
  return track;
}

/**
 * Compute the start time for a new clip. Appends to the end of the track
 * (or uses the drop position if provided).
 */
function computeStartTime(track, duration, dropPercent) {
  if (typeof dropPercent === 'number' && Number.isFinite(dropPercent)) {
    // dropPercent is 0-100 along the track
    return (dropPercent / 100) * 60; // 60s default timelineSeconds
  }
  // Append to end
  const items = track.items || [];
  const lastEnd = items.reduce((max, it) => Math.max(max, it.end || 0), 0);
  return lastEnd;
}

/**
 * Build a clip object from an asset. The clip uses the canonical
 * track.items schema (start/end/assetId/etc) and includes legacy
 * left/width fields as derived properties for compatibility.
 */
export function buildClipFromAsset(asset, start, end) {
  let s = Math.round((Number(start) || 0) * 1000) / 1000;
  let e = Math.round((Number(end) || 0) * 1000) / 1000;
  // Ensure minimum 0.1s duration (add exact 0.1, then round to avoid float drift)
  if (e - s < 0.1) {
    e = Math.round((s * 1000 + 100) / 1000 * 1000) / 1000;
  }
  const dur = Math.round((e - s) * 1000) / 1000;
  return {
    id: newId('clip'),
    assetId: asset.id,
    type: asset.type,
    start: s,
    end: e,
    sourceStart: 0,
    sourceEnd: dur,
    trimIn: 0,
    trimOut: dur,
    lane: 0,
    volume: 1,
    playbackRate: 1,
    opacity: 1,
    transform: { x: 0, y: 0, scale: 1, rotation: 0 },
    effects: [],
    name: asset.name,
    // Legacy aliases (derived from start/end for backwards compat)
    left: 0,
    width: 0,
    src: asset.url,
    poster: asset.thumbnail,
    source: 'upload',
    metadata: { ...(asset.metadata || {}) }
  };
}

/**
 * Insert an asset into the timeline as a new clip.
 * Returns { track, clip }.
 */
export function insertAssetIntoTimeline(state, asset, opts = {}) {
  if (!state || !asset) return null;
  const track = findOrCreateTrack(state, asset.type);
  const duration = asset.duration || (asset.type === 'image' ? 5 : 10);
  const start = computeStartTime(track, duration, opts.dropPercent);
  const end = start + duration;
  const clip = buildClipFromAsset(asset, start, end);
  // Derive left/width from start/end (so the clips/items alias shows them)
  if (typeof state.timelineSeconds === 'number' && state.timelineSeconds > 0) {
    clip.left = (start / state.timelineSeconds) * 100;
    clip.width = (duration / state.timelineSeconds) * 100;
  } else {
    clip.left = 0;
    clip.width = 20;
  }
  track.items = track.items || [];
  track.items.push(clip);
  // track.clips is the same array (via TimelineState._normalizeState alias)
  state.selectedClipId = clip.id;
  return { track, clip };
}

// ============================================================================
// UNDO SNAPSHOT
// ============================================================================

/**
 * Push a snapshot to the editor's undo stack. Tolerant: if the editor
 * hasn't set up an undo stack, this is a no-op.
 */
function pushUndoSnapshot(state) {
  if (!state || !Array.isArray(state.undoStack)) return;
  try {
    const snap = JSON.parse(JSON.stringify({
      projectTitle: state.projectTitle,
      tracks: state.tracks,
      selectedClipId: state.selectedClipId,
      playheadPercent: state.playheadPercent
    }));
    state.undoStack.push(snap);
    if (state.undoStack.length > 50) state.undoStack.shift();
    state.redoStack = Array.isArray(state.redoStack) ? [] : state.redoStack;
  } catch (e) {
    /* snapshot failure is non-fatal */
  }
}

// ============================================================================
// MAIN PIPELINE
// ============================================================================

/**
 * Process a single file upload through the full pipeline.
 *
 * @param {File|Blob} file - The file to process
 * @param {Object} [options]
 * @param {Object} options.state - Editor state (required)
 * @param {string} [options.dropZone] - Where the file came from
 * @param {Function} [options.showToast] - Toast callback
 * @param {boolean} [options.save=true] - Persist after insert
 * @param {boolean} [options.thumbnail=true] - Generate thumbnail
 * @param {boolean} [options.undoSnapshot=true] - Push undo snapshot
 * @param {Function} [options.renderTracks] - Re-render callback
 * @param {number} [options.dropPercent] - 0-100 drop position on track
 * @param {Object} [options.preValidated] - Pre-validated result (skips validation)
 *
 * @returns {Promise<{ success, asset?, clip?, error? }>}
 */
export async function processFileUpload(file, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  if (!file) return { success: false, error: 'No file' };
  if (!opts.state) return { success: false, error: 'No state' };

  // Step 1: Validate
  let validation = opts.preValidated;
  if (!opts.skipValidation) {
    try {
      validation = await validateFileImpl(file);
    } catch (e) {
      return { success: false, error: 'Validation failed: ' + e.message };
    }
  }
  if (!validation || !validation.valid) {
    const err = validation?.error || 'Unsupported file type';
    if (opts.showToast) opts.showToast(err, 'error');
    return { success: false, error: err, validation };
  }

  const { type } = validation;
  const fileName = file.name || 'Untitled';

  // Step 2: Read metadata (full production extraction via metadataExtractor:
  // mediainfo.js for codec/fps/bitrate, exifr for orientation, mp4box for
  // MP4 boxes, music-metadata-browser for audio tags)
  const fullMeta = await extractMetadataImpl(file, type, {
    thumbnail: opts.thumbnail !== false,
    waveform: opts.waveform !== false
  });
  // Legacy shape for backwards compat with buildAsset
  const meta = {
    duration: fullMeta.duration,
    width: fullMeta.width,
    height: fullMeta.height,
    fps: fullMeta.fps,
    codec: fullMeta.codec,
    bitrate: fullMeta.bitrate,
    sampleRate: fullMeta.sampleRate,
    channels: fullMeta.channels,
    container: fullMeta.container,
    rotation: fullMeta.rotation
  };

  // Step 3: Upload
  let publicUrl;
  try {
    publicUrl = await uploadFileToStorage(file);
  } catch (e) {
    if (opts.showToast) opts.showToast(`Upload failed for ${fileName}`, 'error');
    return { success: false, error: e.message || 'Upload failed', validation };
  }

  // Step 4: Generate thumbnail (use the one from fullMeta, or fall back)
  let thumbnail = fullMeta.thumbnail;
  if (!thumbnail && opts.thumbnail && (type === 'image' || type === 'video')) {
    thumbnail = await generateThumbnail(file, type);
  }

  // Step 5: Build asset (merge full production metadata: codec, fps,
  // bitrate, sampleRate, channels, rotation, camera, gps, tags, waveform)
  const asset = buildAsset({ file, type, publicUrl, meta, thumbnail });
  // Augment with extended metadata
  asset.metadata = {
    ...(asset.metadata || {}),
    ...(fullMeta.fps ? { fps: fullMeta.fps } : {}),
    ...(fullMeta.bitrate ? { bitrate: fullMeta.bitrate } : {}),
    ...(fullMeta.codec ? { codec: fullMeta.codec } : {}),
    ...(fullMeta.container ? { container: fullMeta.container } : {}),
    ...(fullMeta.sampleRate ? { sampleRate: fullMeta.sampleRate } : {}),
    ...(fullMeta.channels ? { channels: fullMeta.channels } : {}),
    ...(fullMeta.rotation ? { rotation: fullMeta.rotation } : {}),
    ...(fullMeta.orientation ? { orientation: fullMeta.orientation } : {}),
    ...(fullMeta.camera ? { camera: fullMeta.camera } : {}),
    ...(fullMeta.gps ? { gps: fullMeta.gps } : {}),
    ...(fullMeta.tags && Object.keys(fullMeta.tags).length ? { tags: fullMeta.tags } : {}),
    ...(fullMeta.waveform ? { waveform: fullMeta.waveform } : {})
  };
  // Validate the asset against the schema (permissive)
  validateOrPass(null, asset, 'UploadPipeline.asset');

  // Step 6: Insert into timeline
  const { track, clip } = insertAssetIntoTimeline(opts.state, asset, {
    dropPercent: opts.dropPercent
  }) || {};

  // Add to state.assets so it persists
  opts.state.assets = Array.isArray(opts.state.assets) ? opts.state.assets : [];
  if (!opts.state.assets.some(a => a.id === asset.id)) {
    opts.state.assets.push(asset);
  }

  // Add to media library for the panel
  opts.state.mediaLibrary = Array.isArray(opts.state.mediaLibrary) ? opts.state.mediaLibrary : [];
  if (!opts.state.mediaLibrary.some(m => m.id === asset.id)) {
    opts.state.mediaLibrary.push({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      mimeType: asset.mimeType,
      size: asset.size,
      url: asset.url,
      thumbnail: asset.thumbnail,
      duration: asset.duration,
      uploadedAt: asset.uploadedAt
    });
  }

  // Step 7: Undo snapshot
  if (opts.undoSnapshot) {
    pushUndoSnapshot(opts.state);
  }

  // Step 8: Save
  if (opts.save) {
    try {
      await saveProject(opts.state);
    } catch (e) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('[UploadPipeline] save failed:', e);
      }
    }
  }

  // Step 9: Refresh UI
  if (typeof opts.renderTracks === 'function') {
    try { opts.renderTracks(); } catch (e) { /* render is best-effort */ }
  }

  if (opts.showToast) {
    opts.showToast(`Added ${fileName}`, 'success');
  }

  return { success: true, asset, clip, track, validation };
}

/**
 * Process multiple files (batch upload). Preserves the existing
 * processMultipleFiles API in dragDrop.js while routing through the
 * unified pipeline.
 */
export async function processMultipleFileUploads(files, options = {}) {
  const arr = Array.from(files || []);
  const results = [];
  for (const file of arr) {
    const r = await processFileUpload(file, options);
    results.push(r);
  }
  return results;
}

// ============================================================================
// URL / CLOUD IMPORT
// ============================================================================

/**
 * Fetch a URL and return it as a File object. Used by processUrlUpload
 * and can be used directly for any URL → File conversion.
 *
 * @param {string} url - The URL to fetch (must be CORS-accessible or
 *                       pass through a server proxy)
 * @param {string} [filename] - Optional filename override; derived from
 *                             URL if not provided
 * @returns {Promise<File>}
 */
export async function fetchUrlAsFile(url, filename) {
  if (!url || typeof url !== 'string') throw new Error('Invalid URL');
  const response = await fetch(url, { mode: 'cors' });
  if (!response.ok) throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
  const blob = await response.blob();
  const name = filename || deriveFilenameFromUrl(url) || `url-import-${Date.now()}`;
  const mime = blob.type || '';
  return new File([blob], name, { type: mime });
}

/**
 * Derive a filename from a URL path.
 */
function deriveFilenameFromUrl(url) {
  try {
    const u = new URL(url);
    const pathname = u.pathname || '';
    const last = pathname.split('/').filter(Boolean).pop();
    if (!last) return null;
    // Strip query params if any leaked
    return last.split('?')[0].split('#')[0] || null;
  } catch (e) {
    return null;
  }
}

/**
 * Process a URL import: fetch the URL, convert to File, then run
 * through the full processFileUpload pipeline.
 *
 * @param {string} url
 * @param {Object} options - Same as processFileUpload
 * @returns {Promise<Object>} Result from processFileUpload
 */
export async function processUrlUpload(url, options = {}) {
  if (!url || typeof url !== 'string') {
    return { success: false, error: 'Invalid URL' };
  }
  try {
    const file = await fetchUrlAsFile(url);
    return await processFileUpload(file, { ...options, source: 'url' });
  } catch (e) {
    if (options.showToast) options.showToast(`URL import failed: ${e.message}`, 'error');
    return { success: false, error: e.message || 'URL import failed' };
  }
}

// ============================================================================
// LEGACY-COMPATIBLE EXPORTS
// ============================================================================

/**
 * Backwards-compatible createAssetFromFile (replaces the one in
 * dragDrop.js). Returns the asset, mutates state.assets.
 */
export async function createAssetFromFile(file, type, publicUrl, state) {
  const meta = await readMetadata(file, type);
  const thumbnail = await generateThumbnail(file, type);
  const asset = buildAsset({ file, type, publicUrl, meta, thumbnail });
  if (state) {
    state.assets = Array.isArray(state.assets) ? state.assets : [];
    if (!state.assets.some(a => a.id === asset.id)) state.assets.push(asset);
  }
  return asset;
}

/**
 * Backwards-compatible addAssetToTimeline (replaces the one in
 * dragDrop.js). Inserts the asset as a clip into the appropriate track.
 */
export async function addAssetToTimeline(asset, dropZone, state) {
  if (!state || !asset) return null;
  // The legacy dropZone param could be a track element or a string.
  // For now, use category-based routing.
  const opts = { dropZone };
  return insertAssetIntoTimeline(state, asset, opts);
}

// Re-export validateFile for convenience
export { validateFileImpl as validateFile };
