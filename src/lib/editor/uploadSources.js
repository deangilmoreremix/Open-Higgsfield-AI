/**
 * Upload Sources
 *
 * Wires every upload source to the unified processFileUpload pipeline.
 *
 * Sources wired:
 *   1. Upload Button       — file input change (already wired in TimelineEditorPage)
 *   2. Desktop Drag        — track-lane + global file drop (already wired)
 *   3. Timeline            — track-lane drop calls processFileUpload (already wired)
 *   4. Media Library       — dragDrop.handleMediaDrop + mediaLibrary.handleUpload (already wired)
 *   5. Clipboard           — paste event (NEW: this module)
 *   6. Cloud               — Google Drive, Dropbox, URL fetch (NEW: this module)
 *   7. API                 — programmatic upload via fetch to Netlify function
 *                            (also exposed as window.__apiUpload for external callers)
 *
 * No source bypasses processFileUpload. Every entry point funnels through
 * the same pipeline (validate → metadata → upload → asset → thumbnail →
 * insert → save → undo → toast).
 *
 * Backwards compatible: existing entry points (Upload button, Desktop
 * drag, etc.) keep working. This module adds the new ones (Clipboard,
 * Cloud, API) and provides a single setupUploadSources() helper to
 * wire all of them at once.
 */

import { processFileUpload, fetchUrlAsFile, processUrlUpload } from './uploadPipeline.js';

// ============================================================================
// CLIPBOARD
// ============================================================================

/**
 * Wire clipboard paste handler to a target element (default: document).
 * On paste, extracts image files from clipboardData.items and routes
 * them through processFileUpload.
 *
 * @param {Object} options
 * @param {Object} options.state - Editor state (required)
 * @param {Function} options.showToast - Toast callback
 * @param {Function} options.onUpload - Optional callback(result, file)
 * @param {HTMLElement} [options.target] - Element to attach listener (default: document)
 * @returns {Function} Cleanup function to remove the listener
 */
export function wireClipboardUpload({ state, showToast, onUpload, target } = {}) {
  if (typeof document === 'undefined') return () => {};
  const el = target || document;

  const handler = async (event) => {
    // Only handle if we have a state to insert into
    if (!state) return;

    // Read items from clipboard
    const items = event.clipboardData && event.clipboardData.items;
    if (!items || items.length === 0) return;

    const files = [];
    for (const item of Array.from(items)) {
      // Image files (screenshots, copied images)
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }

    if (files.length === 0) return;

    // Prevent default paste behavior (don't paste as text)
    event.preventDefault();

    for (const file of files) {
      const result = await processFileUpload(file, { state, showToast });
      if (typeof onUpload === 'function') onUpload(result, file);
    }
  };

  el.addEventListener('paste', handler);
  return () => el.removeEventListener('paste', handler);
}

// ============================================================================
// CLOUD IMPORT
// ============================================================================

/**
 * Fetch a file from a URL and route it through processFileUpload.
 * Used for:
 *   - Pasting a URL into the upload dialog
 *   - Google Drive / Dropbox shared links
 *   - Direct HTTPS URLs to media files
 *
 * @param {string} url - The URL to fetch
 * @param {Object} options
 * @param {Object} options.state - Editor state
 * @param {Function} options.showToast - Toast callback
 * @param {string} [options.filename] - Override filename
 * @returns {Promise<Object>} Result from processFileUpload
 */
export async function importFromUrl(url, options = {}) {
  if (!url || typeof url !== 'string') {
    return { success: false, error: 'Invalid URL' };
  }
  // processUrlUpload is a thin wrapper that fetches and processes
  return await processUrlUpload(url, options);
}

/**
 * Normalize a cloud storage URL (Google Drive, Dropbox, etc.) to a direct
 * download URL. Currently supports:
 *   - Google Drive: https://drive.google.com/file/d/{ID}/view → direct download
 *   - Dropbox: https://www.dropbox.com/s/{ID}?dl=0 → ?dl=1
 *   - Direct URLs: returned as-is
 *
 * @param {string} url
 * @returns {string} Normalized direct-download URL
 */
export function normalizeCloudUrl(url) {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();

  // Google Drive: drive.google.com/file/d/{ID}/view
  const gdriveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (gdriveMatch) {
    return `https://drive.google.com/uc?export=download&id=${gdriveMatch[1]}`;
  }

  // Dropbox: www.dropbox.com/s/{ID}?... → add dl=1
  if (trimmed.includes('dropbox.com/') && !trimmed.includes('dl=1')) {
    const u = new URL(trimmed);
    u.searchParams.set('dl', '1');
    return u.toString();
  }

  return trimmed;
}

// ============================================================================
// API UPLOAD
// ============================================================================

/**
 * Upload via the Netlify API endpoint. This is the server-side entry
 * point that other clients (mobile, desktop, webhooks) can call.
 *
 * The server endpoint should:
 *   1. Receive the file (multipart/form-data or base64)
 *   2. Call processFileUpload server-side
 *   3. Return the asset + clip metadata
 *
 * @param {File|Blob} file
 * @param {Object} options
 * @param {string} [options.endpoint='/api/upload'] - Netlify function endpoint
 * @param {Object} [options.state] - Client-side state (for client fallback)
 * @param {Function} [options.showToast] - Toast callback
 * @param {Function} [options.onUpload] - Callback(result, file)
 * @returns {Promise<Object>}
 */
export async function apiUpload(file, options = {}) {
  if (!file) return { success: false, error: 'No file' };
  const endpoint = options.endpoint || '/api/upload';
  const showToast = options.showToast;
  const state = options.state;
  const onUpload = options.onUpload;

  try {
    // Build multipart form
    const form = new FormData();
    form.append('file', file, file.name || 'upload');

    const response = await fetch(endpoint, {
      method: 'POST',
      body: form
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => response.statusText);
      // Server unreachable — fall back to client-side processFileUpload
      if (state) {
        if (showToast) showToast('API upload failed, using client upload', 'warning');
        const result = await processFileUpload(file, { state, showToast });
        if (typeof onUpload === 'function') onUpload(result, file);
        return result;
      }
      return { success: false, error: `API upload failed: ${errText}` };
    }

    const data = await response.json();
    if (showToast) showToast('Upload complete', 'success');
    const result = { success: true, source: 'api', data };
    if (typeof onUpload === 'function') onUpload(result, file);
    return result;
  } catch (e) {
    // Network error — fall back to client-side
    if (state) {
      if (showToast) showToast('API unavailable, using client upload', 'warning');
      const result = await processFileUpload(file, { state, showToast });
      if (typeof onUpload === 'function') onUpload(result, file);
      return result;
    }
    return { success: false, error: e.message || 'API upload failed' };
  }
}

// ============================================================================
// UNIFIED SETUP
// ============================================================================

/**
 * Wire all upload sources at once. Call this from the page mount or
 * app init to enable Clipboard, Cloud import, and API upload alongside
 * the existing Upload button, Desktop drag, and Media Library.
 *
 * @param {Object} options
 * @param {Object} options.state - Editor state
 * @param {Function} options.showToast - Toast callback
 * @param {Function} [options.onUpload] - Optional callback for all sources
 * @param {HTMLElement} [options.target] - Element for clipboard listener
 * @returns {Function} Cleanup function that removes all listeners
 */
export function setupUploadSources({ state, showToast, onUpload, target } = {}) {
  const cleanups = [];

  // 5. Clipboard
  cleanups.push(wireClipboardUpload({ state, showToast, onUpload, target }));

  // Expose API upload globally for programmatic access (optional, non-breaking)
  if (typeof window !== 'undefined') {
    window.__apiUpload = (file) => apiUpload(file, { state, showToast, onUpload });
    window.__importFromUrl = (url) => importFromUrl(url, { state, showToast });
  }

  return () => {
    cleanups.forEach(fn => { try { fn(); } catch (e) { /* best-effort */ } });
    if (typeof window !== 'undefined') {
      delete window.__apiUpload;
      delete window.__importFromUrl;
    }
  };
}
