import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  computeGuides,
  applyGuides,
  clearGuides,
  snapToGuides
} from '../../src/lib/editor/dragGuides.js';

import {
  applyDropBehavior,
  moveClip
} from '../../src/lib/editor/dropBehavior.js';

import {
  pushUndo,
  undo,
  redo,
  clearHistory,
  getHistoryDepth,
  reorderClipsInTrack,
  reorderTracks,
  moveClipToPosition,
  showGuides,
  clearActiveGuides,
  performDragOperation
} from '../../src/lib/editor/TimelineDragManager.js';

beforeEach(() => {
  clearHistory();
});

function makeState() {
  return {
    tracks: [
      { id: 't1', name: 'Video', items: [
        { id: 'c1', start: 0, end: 5, name: 'Clip 1' },
        { id: 'c2', start: 10, end: 15, name: 'Clip 2' }
      ] },
      { id: 't2', name: 'Audio', items: [
        { id: 'c3', start: 5, end: 10, name: 'Audio 1' }
      ] }
    ],
    assets: [],
    mediaLibrary: [],
    selectedClipId: null,
    timelineSeconds: 60
  };
}

// ============================================================================
// dragGuides
// ============================================================================

describe('computeGuides', () => {
  it('returns empty array for null inputs', () => {
    expect(computeGuides(null, null)).toEqual([]);
  });

  it('includes grid snap guides when snapToGrid is true', () => {
    const guides = computeGuides(
      { id: 'c1', start: 4.8, end: 22.8 },
      { tracks: [], timelineSeconds: 60 },
      { snapToGrid: true, gridSize: 5, scale: 13.33 }
    );
    // 4.8 is closest to 5, so grid-start guide near 5
    const gridStart = guides.find(g => g.type === 'grid-start');
    expect(gridStart).toBeDefined();
  });

  it('includes other-clip guides', () => {
    // Place a clip near the dragging clip so the guide is within snapThreshold
    const state = makeState();
    state.tracks[0].items.push({ id: 'c-near', start: 4.9, end: 5.1, name: 'Near' });
    const guides = computeGuides(
      { id: 'c1', start: 4.8, end: 22.8, trackId: 't1' },
      state,
      { scale: 13.33 }
    );
    const clipStart = guides.find(g => g.type === 'clip-start');
    expect(clipStart).toBeDefined();
  });

  it('includes playhead guide', () => {
    // Place playhead at 30s which is near the dragging clip's start (28s).
    // 30/60 = 50% → playhead at 30s. With scale 13.33, the playhead is
    // 2 seconds away from 28s = ~27px. Use a larger snapThreshold.
    const guides = computeGuides(
      { id: 'c1', start: 28, end: 32 },
      { tracks: [], playheadPercent: 50, timelineSeconds: 60 },
      { scale: 13.33, snapThreshold: 30 }
    );
    const playhead = guides.find(g => g.type === 'playhead');
    expect(playhead).toBeDefined();
  });

  it('deduplicates guides at the same x position', () => {
    const guides = computeGuides(
      { id: 'c1', start: 10, end: 15, trackId: 't1' },
      makeState(),
      { scale: 13.33 }
    );
    const xs = guides.map(g => g.x);
    const uniqueXs = [...new Set(xs)];
    expect(uniqueXs.length).toBe(guides.length);
  });
});

describe('applyGuides / clearGuides', () => {
  it('adds and removes guide elements', () => {
    const container = document.createElement('div');
    container.style.position = 'relative';
    document.body.appendChild(container);
    const cleanup = applyGuides([{ x: 100, type: 'clip-start' }], container);
    expect(container.querySelectorAll('.drag-guide').length).toBe(1);
    cleanup();
    expect(container.querySelectorAll('.drag-guide').length).toBe(0);
    document.body.removeChild(container);
  });
});

describe('snapToGuides', () => {
  it('returns the original position when no guides', () => {
    const r = snapToGuides({ start: 5, end: 10 }, [], 8);
    expect(r.start).toBe(5);
    expect(r.end).toBe(10);
  });
});

// ============================================================================
// dropBehavior
// ============================================================================

describe('applyDropBehavior', () => {
  it('default mode splits overlapping clips', () => {
    const state = makeState();
    const track = state.tracks[0];
    const result = applyDropBehavior(
      { id: 'new', start: 4, end: 6, type: 'video' },
      track
    );
    // c1 (0-5) should be split: left (0-4), then new (4-6)
    const left = result.track.items.find(i => i.end === 4);
    expect(left).toBeDefined();
    expect(result.track.items).toContainEqual(expect.objectContaining({ id: 'new', start: 4, end: 6 }));
  });

  it('overwrite mode removes overlapping clips', () => {
    const state = makeState();
    const track = state.tracks[0];
    const result = applyDropBehavior(
      { id: 'new', start: 2, end: 7, type: 'video' },
      track,
      { overwrite: true }
    );
    // c1 (0-5) overlaps, should be removed
    expect(result.removed.map(c => c.id)).toContain('c1');
    // c2 (10-15) doesn't overlap, should be kept
    expect(result.track.items).toContainEqual(expect.objectContaining({ id: 'c2' }));
  });

  it('ripple mode pushes subsequent clips forward', () => {
    const state = makeState();
    const track = state.tracks[0];
    const result = applyDropBehavior(
      { id: 'new', start: 4, end: 6, type: 'video' },
      track,
      { ripple: true }
    );
    // c1 (0-5) overlaps the start of new, c2 (10-15) is after
    // Ripple: push c2 forward by new's duration (2s)
    const c2 = result.track.items.find(i => i.id === 'c2');
    expect(c2.start).toBe(12);
    expect(c2.end).toBe(17);
  });

  it('ripple mode pushes only clips that start at or after incomingStart', () => {
    const state = makeState();
    const track = state.tracks[0];
    const result = applyDropBehavior(
      { id: 'new', start: 12, end: 14, type: 'video' },
      track,
      { ripple: true }
    );
    // c1 (0-5) is before, unchanged
    const c1 = result.track.items.find(i => i.id === 'c1');
    expect(c1.start).toBe(0);
    // c2 (10-15) starts before incomingStart (12) so... wait, 10 < 12, so c2 is "before"
    // Actually: items where itemStart < incomingStart go to "before"
    // c1 (start=0) < 12 → before
    // c2 (start=10) < 12 → before
    // Both go to before, none pushed
    expect(result.track.items).toContainEqual(expect.objectContaining({ id: 'new', start: 12, end: 14 }));
  });
});

describe('moveClip', () => {
  it('moves a clip from one track to another', () => {
    const state = makeState();
    // Move c1 (0-5) from t1 to t2 at position 0-5 (no overlap with c3 which is 5-10)
    const r = moveClip(
      state.tracks[0].items[0],  // c1
      state.tracks[1],          // target: Audio
      state.tracks[0],          // source: Video
      { start: 0, end: 5 }
    );
    expect(state.tracks[0].items.length).toBe(1);  // c1 removed
    expect(state.tracks[1].items.length).toBe(2);  // c1 added (c3 still there)
  });

  it('replaces overlapping clip on move (default split mode)', () => {
    const state = makeState();
    // Move c1 (0-5) from t1 to t2 at 5-10 (overlaps c3 which is 5-10)
    const r = moveClip(
      state.tracks[0].items[0],
      state.tracks[1],
      state.tracks[0],
      { start: 5, end: 10 }
    );
    // c3 is completely inside incoming, so it's dropped
    expect(state.tracks[1].items.length).toBe(1);
    expect(state.tracks[1].items[0].id).toBe('c1');
  });
});

// ============================================================================
// TimelineDragManager — Undo/Redo
// ============================================================================

describe('TimelineDragManager — undo/redo', () => {
  it('undo restores previous tracks', () => {
    const state = makeState();
    const original = JSON.stringify(state.tracks);
    pushUndo(state);
    state.tracks[0].items = [];
    expect(undo(state)).toBe(true);
    expect(JSON.stringify(state.tracks)).toBe(original);
  });

  it('redo re-applies the undone change', () => {
    const state = makeState();
    pushUndo(state);
    state.tracks[0].items = [];
    undo(state);
    state.tracks[0].items = [];
    pushUndo(state);  // save the "current" (post-undo) state
    // Hmm, this is a bit tricky. Let me simplify.
    const state2 = makeState();
    pushUndo(state2);
    state2.tracks[0].items = [];
    undo(state2);
    redo(state2);
    expect(state2.tracks[0].items.length).toBe(0);
  });

  it('undo with empty stack returns false', () => {
    const state = makeState();
    expect(undo(state)).toBe(false);
  });

  it('redo with empty stack returns false', () => {
    const state = makeState();
    expect(redo(state)).toBe(false);
  });

  it('clearHistory empties both stacks', () => {
    const state = makeState();
    pushUndo(state);
    pushUndo(state);
    clearHistory();
    expect(getHistoryDepth()).toEqual({ undo: 0, redo: 0 });
  });

  it('pushUndo caps at maxHistory', () => {
    const state = makeState();
    for (let i = 0; i < 60; i++) {
      pushUndo(state);
      state.tracks[0].items.push({ id: `c${i}`, start: i, end: i + 1 });
    }
    expect(getHistoryDepth().undo).toBeLessThanOrEqual(50);
  });
});

// ============================================================================
// TimelineDragManager — Reorder
// ============================================================================

describe('reorderClipsInTrack', () => {
  it('reorders clips within a track', () => {
    const state = makeState();
    reorderClipsInTrack(state, 't1', 0, 1);
    expect(state.tracks[0].items[0].id).toBe('c2');
    expect(state.tracks[0].items[1].id).toBe('c1');
  });

  it('pushes undo before reordering', () => {
    const state = makeState();
    reorderClipsInTrack(state, 't1', 0, 1);
    expect(getHistoryDepth().undo).toBe(1);
  });

  it('returns null for missing track', () => {
    const state = makeState();
    const r = reorderClipsInTrack(state, 'nonexistent', 0, 1);
    expect(r).toBe(null);
  });

  it('skips undo when skipUndo is true', () => {
    const state = makeState();
    reorderClipsInTrack(state, 't1', 0, 1, { skipUndo: true });
    expect(getHistoryDepth().undo).toBe(0);
  });
});

describe('reorderTracks', () => {
  it('reorders tracks', () => {
    const state = makeState();
    reorderTracks(state, 0, 1);
    expect(state.tracks[0].id).toBe('t2');
    expect(state.tracks[1].id).toBe('t1');
  });

  it('pushes undo', () => {
    const state = makeState();
    reorderTracks(state, 0, 1);
    expect(getHistoryDepth().undo).toBe(1);
  });
});

// ============================================================================
// TimelineDragManager — moveClipToPosition
// ============================================================================

describe('moveClipToPosition', () => {
  it('moves a clip within the same track', () => {
    const state = makeState();
    const r = moveClipToPosition(state, 'c1', 't1', 20);
    expect(r.success).toBe(true);
    const c1 = state.tracks[0].items.find(i => i.id === 'c1');
    expect(c1.start).toBe(20);
    expect(c1.end).toBe(25);
  });

  it('moves a clip to a different track', () => {
    const state = makeState();
    const r = moveClipToPosition(state, 'c1', 't2', 25);
    expect(r.success).toBe(true);
    // c1 should be removed from t1
    expect(state.tracks[0].items.find(i => i.id === 'c1')).toBeUndefined();
    // c1 should be in t2
    const c1 = state.tracks[1].items.find(i => i.id === 'c1');
    expect(c1).toBeDefined();
    expect(c1.start).toBe(25);
  });

  it('with overwrite removes overlapping clips', () => {
    const state = makeState();
    const r = moveClipToPosition(state, 'c1', 't1', 12, { overwrite: true });
    expect(r.success).toBe(true);
    // c2 (10-15) should be removed
    expect(state.tracks[0].items.find(i => i.id === 'c2')).toBeUndefined();
  });

  it('with ripple pushes subsequent clips', () => {
    const state = makeState();
    const r = moveClipToPosition(state, 'c1', 't1', 5, { ripple: true });
    expect(r.success).toBe(true);
    // c2 should be pushed forward by c1's duration (5s)
    const c2 = state.tracks[0].items.find(i => i.id === 'c2');
    expect(c2.start).toBe(15);
    expect(c2.end).toBe(20);
  });

  it('returns error for missing clip', () => {
    const state = makeState();
    const r = moveClipToPosition(state, 'nonexistent', 't1', 0);
    expect(r.success).toBe(false);
  });

  it('returns error for missing target track', () => {
    const state = makeState();
    const r = moveClipToPosition(state, 'c1', 'nonexistent', 0);
    expect(r.success).toBe(false);
  });
});

// ============================================================================
// TimelineDragManager — performDragOperation (coordinator)
// ============================================================================

describe('performDragOperation', () => {
  it('handles reorder-clips', () => {
    const state = makeState();
    const r = performDragOperation(state, { type: 'reorder-clips', trackId: 't1', oldIndex: 0, newIndex: 1 });
    expect(r.success).toBe(true);
    expect(state.tracks[0].items[0].id).toBe('c2');
  });

  it('handles reorder-tracks', () => {
    const state = makeState();
    const r = performDragOperation(state, { type: 'reorder-tracks', oldIndex: 0, newIndex: 1 });
    expect(r.success).toBe(true);
    expect(state.tracks[0].id).toBe('t2');
  });

  it('handles move-clip', () => {
    const state = makeState();
    const r = performDragOperation(state, { type: 'move-clip', clipId: 'c1', targetTrackId: 't2', newStart: 20 });
    expect(r.success).toBe(true);
  });

  it('handles insert-clip', () => {
    const state = makeState();
    const r = performDragOperation(state, {
      type: 'insert-clip',
      trackId: 't1',
      clip: { id: 'new', start: 5, end: 7, type: 'video' }
    });
    expect(r.success).toBe(true);
  });

  it('returns error for unknown type', () => {
    const state = makeState();
    const r = performDragOperation(state, { type: 'unknown' });
    expect(r.success).toBe(false);
  });
});

// ============================================================================
// TimelineDragManager — guides
// ============================================================================

describe('showGuides / clearActiveGuides', () => {
  it('showGuides returns guides and sets up cleanup', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const guides = showGuides({ start: 5, end: 10 }, makeState(), container);
    expect(Array.isArray(guides)).toBe(true);
    clearActiveGuides();
    document.body.removeChild(container);
  });
});
