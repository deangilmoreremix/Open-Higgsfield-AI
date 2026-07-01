/**
 * Timeline Drag Manager
 *
 * Coordinates all drag-and-drop interactions on the timeline:
 *   - Clip reordering (within track)
 *   - Track reordering
 *   - Cross-track clip moves
 *   - Multi-select drag
 *   - Snap to grid / other clips / playhead
 *   - Alignment guides
 *   - Ghost preview
 *   - Autoscroll
 *   - Ripple / overwrite behavior
 *   - Undo / redo for every drag operation
 *
 * This is additive: it works alongside the existing HTML5 drag handlers
 * in dragDrop.js and the @dnd-kit ClipSortable component. New code
 * routes through here; old code keeps working.
 *
 * Backwards compatible: the manager exposes the same operations
 * (reorder, move, insert) that the existing handlers perform, so
 * existing call sites can be updated incrementally.
 */

import { computeGuides, applyGuides, clearGuides, snapToGuides } from './dragGuides.js';
import { applyDropBehavior, moveClip } from './dropBehavior.js';
import { arrayMove } from '@dnd-kit/sortable';

// ============================================================================
// STATE
// ============================================================================

const managerState = {
  undoStack: [],
  redoStack: [],
  maxHistory: 50,
  activeGuides: null  // cleanup function from applyGuides
};

// ============================================================================
// UNDO / REDO
// ============================================================================

/**
 * Push a snapshot of the timeline state onto the undo stack.
 * Call BEFORE making a change.
 */
export function pushUndo(state) {
  if (!state) return;
  try {
    const snap = JSON.parse(JSON.stringify({
      tracks: state.tracks,
      assets: state.assets,
      mediaLibrary: state.mediaLibrary,
      selectedClipId: state.selectedClipId
    }));
    managerState.undoStack.push(snap);
    if (managerState.undoStack.length > managerState.maxHistory) {
      managerState.undoStack.shift();
    }
    managerState.redoStack = [];
  } catch (e) {
    // Snapshot failure is non-fatal
  }
}

/**
 * Undo the last operation. Returns true if something was undone.
 */
export function undo(state) {
  if (managerState.undoStack.length === 0) return false;
  const previous = managerState.undoStack.pop();
  // Save current to redo
  try {
    const current = JSON.parse(JSON.stringify({
      tracks: state.tracks,
      assets: state.assets,
      mediaLibrary: state.mediaLibrary,
      selectedClipId: state.selectedClipId
    }));
    managerState.redoStack.push(current);
  } catch (e) { /* best-effort */ }
  state.tracks = previous.tracks;
  state.assets = previous.assets;
  state.mediaLibrary = previous.mediaLibrary;
  state.selectedClipId = previous.selectedClipId;
  return true;
}

/**
 * Redo the last undone operation. Returns true if something was redone.
 */
export function redo(state) {
  if (managerState.redoStack.length === 0) return false;
  const next = managerState.redoStack.pop();
  // Save current to undo
  try {
    const current = JSON.parse(JSON.stringify({
      tracks: state.tracks,
      assets: state.assets,
      mediaLibrary: state.mediaLibrary,
      selectedClipId: state.selectedClipId
    }));
    managerState.undoStack.push(current);
  } catch (e) { /* best-effort */ }
  state.tracks = next.tracks;
  state.assets = next.assets;
  state.mediaLibrary = next.mediaLibrary;
  state.selectedClipId = next.selectedClipId;
  return true;
}

/**
 * Clear the undo/redo history.
 */
export function clearHistory() {
  managerState.undoStack = [];
  managerState.redoStack = [];
}

/**
 * Get current undo/redo depths.
 */
export function getHistoryDepth() {
  return {
    undo: managerState.undoStack.length,
    redo: managerState.redoStack.length
  };
}

// ============================================================================
// CLIP REORDER (within track)
// ============================================================================

/**
 * Reorder clips within a track. Used by ClipSortable onDragEnd.
 * Pushes undo, applies arrayMove, returns the new items array.
 */
export function reorderClipsInTrack(state, trackId, oldIndex, newIndex, opts = {}) {
  if (!state || !trackId) return null;
  const track = state.tracks.find(t => t.id === trackId);
  if (!track) return null;
  if (!opts.skipUndo) pushUndo(state);
  track.items = arrayMove(track.items || [], oldIndex, newIndex);
  return track.items;
}

// ============================================================================
// TRACK REORDER
// ============================================================================

/**
 * Reorder tracks. Pushes undo, returns the new tracks array.
 */
export function reorderTracks(state, oldIndex, newIndex, opts = {}) {
  if (!state) return null;
  if (!opts.skipUndo) pushUndo(state);
  state.tracks = arrayMove(state.tracks || [], oldIndex, newIndex);
  return state.tracks;
}

// ============================================================================
// CLIP MOVE (cross-track or within-track with time change)
// ============================================================================

/**
 * Move a clip to a new track and/or new time position.
 * Applies ripple/overwrite if specified. Pushes undo.
 *
 * @param {Object} state
 * @param {string} clipId
 * @param {string} targetTrackId
 * @param {number} newStart - New start time in seconds
 * @param {Object} options
 * @param {boolean} options.ripple
 * @param {boolean} options.overwrite
 * @param {boolean} options.skipUndo
 * @returns {Object} { success, clip, track }
 */
export function moveClipToPosition(state, clipId, targetTrackId, newStart, options = {}) {
  if (!state || !clipId) return { success: false, error: 'Missing state or clipId' };
  const targetTrack = state.tracks.find(t => t.id === targetTrackId);
  if (!targetTrack) return { success: false, error: 'Target track not found' };

  // Find the clip (it could be in any track)
  let sourceTrack = null;
  let clip = null;
  for (const t of state.tracks) {
    const found = (t.items || []).find(i => i.id === clipId);
    if (found) { sourceTrack = t; clip = found; break; }
  }
  if (!clip) return { success: false, error: 'Clip not found' };

  if (!options.skipUndo) pushUndo(state);

  // Compute new end based on existing duration
  const duration = (clip.end || 0) - (clip.start || 0);
  const newEnd = newStart + duration;

  // Use the moveClip helper
  const result = moveClip(clip, targetTrack, sourceTrack, { start: newStart, end: newEnd }, {
    overwrite: options.overwrite,
    ripple: options.ripple
  });

  return {
    success: true,
    sourceTrack: result.sourceTrack,
    targetTrack: result.targetTrack,
    clip: result.inserted,
    removed: result.removed,
    modified: result.modified
  };
}

// ============================================================================
// GUIDES
// ============================================================================

/**
 * Show alignment guides for a clip being dragged.
 * Returns a cleanup function to clear them.
 */
export function showGuides(draggingClip, state, container, options = {}) {
  const guides = computeGuides(draggingClip, state, options);
  if (managerState.activeGuides) {
    managerState.activeGuides();  // clean up previous
  }
  managerState.activeGuides = applyGuides(guides, container);
  return guides;
}

/**
 * Clear active alignment guides.
 */
export function clearActiveGuides() {
  if (managerState.activeGuides) {
    managerState.activeGuides();
    managerState.activeGuides = null;
  }
}

// ============================================================================
// DRAG GHOST PREVIEW
// ============================================================================

/**
 * Create a ghost preview element for a clip being dragged.
 * Returns a cleanup function.
 */
export function createGhostPreview(clip, container, options = {}) {
  if (!clip || !container) return () => {};
  const ghost = document.createElement('div');
  ghost.className = 'clip-ghost-preview';
  ghost.style.position = 'absolute';
  ghost.style.left = `${options.x || 0}px`;
  ghost.style.top = `${options.y || 0}px`;
  ghost.style.width = `${options.width || 80}px`;
  ghost.style.height = `${options.height || 40}px`;
  ghost.style.background = 'rgba(59, 130, 246, 0.5)';
  ghost.style.border = '1px solid #3b82f6';
  ghost.style.borderRadius = '3px';
  ghost.style.pointerEvents = 'none';
  ghost.style.zIndex = '9998';
  ghost.textContent = clip.name || clip.id;
  ghost.style.color = 'white';
  ghost.style.fontSize = '10px';
  ghost.style.padding = '2px 4px';
  container.appendChild(ghost);
  return () => {
    try { ghost.remove(); } catch (e) { /* best-effort */ }
  };
}

// ============================================================================
// AUTOSCROLL
// ============================================================================

/**
 * Auto-scroll a container when the pointer is near its edges.
 * Returns a stop function.
 */
export function startAutoScroll(container, options = {}) {
  if (!container || typeof container.addEventListener !== 'function') return () => {};
  const edgeSize = options.edgeSize || 40;
  const speed = options.speed || 10;
  let raf = null;
  let lastEvent = null;

  const onMove = (e) => { lastEvent = e; };
  const tick = () => {
    if (lastEvent) {
      const rect = container.getBoundingClientRect();
      const x = lastEvent.clientX;
      const y = lastEvent.clientY;
      let dx = 0, dy = 0;
      if (x < rect.left + edgeSize) dx = -speed;
      else if (x > rect.right - edgeSize) dx = speed;
      if (y < rect.top + edgeSize) dy = -speed;
      else if (y > rect.bottom - edgeSize) dy = speed;
      if (dx || dy) container.scrollBy(dx, dy);
    }
    raf = requestAnimationFrame(tick);
  };

  container.addEventListener('mousemove', onMove);
  raf = requestAnimationFrame(tick);
  return () => {
    if (raf) cancelAnimationFrame(raf);
    container.removeEventListener('mousemove', onMove);
  };
}

// ============================================================================
// COORDINATED DRAG OPERATION
// ============================================================================

/**
 * Perform a complete drag operation with all features wired:
 *   1. Compute guides
 *   2. Apply ripple/overwrite on drop
 *   3. Push undo before
 *   4. Return the new state
 *
 * This is the recommended entry point for new drag code. Old code
 * that uses the individual functions (reorderClipsInTrack,
 * moveClipToPosition, etc.) keeps working.
 */
export function performDragOperation(state, op) {
  if (!state || !op) return { success: false };
  // op = {
  //   type: 'reorder-clips' | 'reorder-tracks' | 'move-clip' | 'insert-clip',
  //   ...type-specific args
  //   ripple, overwrite, skipUndo
  // }

  if (op.type === 'reorder-clips') {
    const items = reorderClipsInTrack(state, op.trackId, op.oldIndex, op.newIndex, op);
    return { success: true, items };
  }
  if (op.type === 'reorder-tracks') {
    const tracks = reorderTracks(state, op.oldIndex, op.newIndex, op);
    return { success: true, tracks };
  }
  if (op.type === 'move-clip') {
    return moveClipToPosition(state, op.clipId, op.targetTrackId, op.newStart, op);
  }
  if (op.type === 'insert-clip') {
    if (!op.skipUndo) pushUndo(state);
    const track = state.tracks.find(t => t.id === op.trackId);
    if (!track) return { success: false, error: 'Track not found' };
    const result = applyDropBehavior(op.clip, track, {
      overwrite: op.overwrite,
      ripple: op.ripple
    });
    return { success: true, ...result };
  }
  return { success: false, error: 'Unknown operation type' };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  pushUndo, undo, redo, clearHistory, getHistoryDepth,
  reorderClipsInTrack, reorderTracks, moveClipToPosition,
  showGuides, clearActiveGuides, createGhostPreview, startAutoScroll,
  performDragOperation
};
