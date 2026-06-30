/**
 * File validation with magic-byte detection.
 *
 * Validation chain (most → least reliable):
 *   1. Magic bytes via `file-type` (reads file header, ignores MIME/extension)
 *   2. Browser-reported MIME via File.type
 *   3. File extension via `mime-types`
 *
 * Returns { valid, type, config, detected, source } where:
 *   - type: 'video' | 'audio' | 'image' | 'text' | 'document' | 'unknown'
 *   - detected: { ext, mime } from file-type (or null)
 *   - source: 'magic' | 'mime' | 'extension' (which chain matched)
 */

import { fileTypeFromBlob } from 'file-type';
import mime from 'mime-types';

// ============================================================================
// FILE TYPE CONFIGURATIONS (max sizes, icons, colors)
// ============================================================================

export const FILE_TYPE_CONFIG = {
  video: {
    label: 'Video',
    extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v', 'flv', 'wmv', '3gp', 'ogv'],
    mimeTypes: [
      'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
      'video/webm', 'video/x-flv', 'video/x-ms-wmv', 'video/3gpp', 'video/ogg',
      'video/x-m4v'
    ],
    maxSize: 500 * 1024 * 1024, // 500MB
    icon: '🎥',
    color: '#ff6b6b'
  },
  audio: {
    label: 'Audio',
    extensions: ['mp3', 'wav', 'aac', 'ogg', 'flac', 'm4a', 'opus', 'wma', 'aiff', 'aif'],
    mimeTypes: [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/aac',
      'audio/ogg', 'audio/flac', 'audio/mp4', 'audio/x-m4a', 'audio/opus',
      'audio/x-ms-wma', 'audio/aiff', 'audio/x-aiff'
    ],
    maxSize: 100 * 1024 * 1024, // 100MB
    icon: '🎵',
    color: '#4ecdc4'
  },
  image: {
    label: 'Image',
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff', 'heic', 'avif'],
    mimeTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'image/bmp', 'image/tiff', 'image/heic', 'image/heif', 'image/avif',
      'image/x-icon'
    ],
    maxSize: 50 * 1024 * 1024, // 50MB
    icon: '🖼️',
    color: '#45b7d1'
  },
  text: {
    label: 'Text',
    extensions: ['txt', 'md', 'json', 'csv', 'xml', 'html', 'htm', 'srt', 'vtt', 'ass'],
    mimeTypes: [
      'text/plain', 'text/markdown', 'application/json', 'text/csv',
      'application/xml', 'text/xml', 'text/html', 'application/x-subrip',
      'text/vtt', 'text/srt'
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
    icon: '📄',
    color: '#96ceb4'
  },
  document: {
    label: 'Document',
    extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
    mimeTypes: [
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ],
    maxSize: 50 * 1024 * 1024,
    icon: '📑',
    color: '#f7b731'
  }
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Map a detected MIME type or extension to a category (video/audio/image/etc).
 * Uses FILE_TYPE_CONFIG as the lookup table.
 */
export function categorize(mimeType, extension) {
  if (mimeType) {
    const m = String(mimeType).toLowerCase();
    for (const [category, config] of Object.entries(FILE_TYPE_CONFIG)) {
      if (config.mimeTypes.includes(m)) {
        return { category, config };
      }
    }
    // Substring fallback: 'video/*' → video
    if (m.startsWith('video/')) return { category: 'video', config: FILE_TYPE_CONFIG.video };
    if (m.startsWith('audio/')) return { category: 'audio', config: FILE_TYPE_CONFIG.audio };
    if (m.startsWith('image/')) return { category: 'image', config: FILE_TYPE_CONFIG.image };
    if (m.startsWith('text/')) return { category: 'text', config: FILE_TYPE_CONFIG.text };
    if (m === 'application/pdf' || m.includes('msword') || m.includes('officedocument')) {
      return { category: 'document', config: FILE_TYPE_CONFIG.document };
    }
  }
  if (extension) {
    const ext = String(extension).toLowerCase();
    for (const [category, config] of Object.entries(FILE_TYPE_CONFIG)) {
      if (config.extensions.includes(ext)) {
        return { category, config };
      }
    }
  }
  return { category: 'unknown', config: null };
}

export function formatFileSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = Number(bytes) || 0;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// ============================================================================
// MAGIC-BYTE DETECTION (with fallbacks)
// ============================================================================

/**
 * Detect file type using magic bytes (file-type), then fall back to
 * browser MIME, then to extension via mime-types.
 *
 * @param {File|Blob} file - The file to validate
 * @param {Object} [opts]
 * @param {number} [opts.bytesToRead=4096] - Bytes to read for magic-byte detection
 * @returns {Promise<{ valid: boolean, type: string, config: object, detected: object|null, source: string, error?: string }>}
 */
export async function validateFile(file, opts = {}) {
  if (!file) return { valid: false, type: 'unknown', config: null, detected: null, source: 'none', error: 'No file provided' };

  const bytesToRead = opts.bytesToRead || 4096;
  let detected = null;
  let source = 'none';

  // 1. Magic bytes (most reliable — works on OS-dragged files with no MIME)
  try {
    if (typeof file.slice === 'function') {
      const head = file.slice(0, bytesToRead);
      detected = await fileTypeFromBlob(head);
      if (detected) source = 'magic';
    }
  } catch (e) {
    // file-type can throw on empty/special blobs; fall through
    detected = null;
  }

  // 2. Browser-reported MIME
  const browserMime = file.type || '';

  // 3. Extension via mime-types
  const fileName = file.name || '';
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  const mimeFromExt = ext ? mime.lookup(ext) || '' : '';

  // Pick the best category: prefer magic-byte result, then browser MIME, then extension
  let result;
  if (detected && detected.mime) {
    result = categorize(detected.mime, detected.ext);
  } else if (browserMime) {
    result = categorize(browserMime, ext);
    if (result.category !== 'unknown') source = source === 'none' ? 'mime' : source;
  } else if (mimeFromExt) {
    result = categorize(mimeFromExt, ext);
    if (result.category !== 'unknown') source = source === 'none' ? 'extension' : source;
  } else if (ext) {
    result = categorize('', ext);
    if (result.category !== 'unknown') source = source === 'none' ? 'extension' : source;
  } else {
    result = { category: 'unknown', config: null };
  }

  const { category, config } = result;

  if (category === 'unknown' || !config) {
    return {
      valid: false,
      type: 'unknown',
      config: null,
      detected,
      source,
      error: 'Unsupported file type'
    };
  }

  // Size check
  if (file.size != null && file.size > config.maxSize) {
    return {
      valid: false,
      type: category,
      config,
      detected,
      source,
      error: `File too large. Maximum size for ${category} files is ${formatFileSize(config.maxSize)}`
    };
  }

  return {
    valid: true,
    type: category,
    config,
    detected,
    source,
    mime: detected?.mime || browserMime || mimeFromExt || '',
    ext: detected?.ext || ext || ''
  };
}

/**
 * Synchronous fallback validation (no magic bytes). Use only when
 * async is not possible (e.g., in a synchronous event handler).
 * Checks browser MIME and extension only.
 */
export function validateFileSync(file) {
  if (!file) return { valid: false, type: 'unknown', config: null, source: 'none', error: 'No file provided' };

  const browserMime = file.type || '';
  const fileName = file.name || '';
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  const mimeFromExt = ext ? mime.lookup(ext) || '' : '';

  const result = browserMime
    ? categorize(browserMime, ext)
    : (mimeFromExt ? categorize(mimeFromExt, ext) : categorize('', ext));

  const { category, config } = result;

  if (category === 'unknown' || !config) {
    return { valid: false, type: 'unknown', config: null, source: 'none', error: 'Unsupported file type' };
  }

  if (file.size != null && file.size > config.maxSize) {
    return { valid: false, type: category, config, source: 'none', error: `File too large` };
  }

  return { valid: true, type: category, config, source: 'extension', mime: browserMime || mimeFromExt, ext };
}
