/**
 * Drop Behavior — ripple and overwrite logic for drag operations
 *
 * Two drop modes when inserting a clip at a position where another
 * clip already exists:
 *
 *   - Overwrite: replace the existing clip. The new clip takes the
 *     same time range; the old clip is removed.
 *
 *   - Ripple: insert the new clip and push all subsequent clips on
 *     the same track forward by the new clip's duration. Existing
 *     clips keep their order and content; gaps are inserted.
 *
 * Both modes preserve clip identity for unaffected clips.
 */

const DEFAULT_OPTIONS = {
  overwrite: false,
  ripple: false,
  // If true, the incoming clip's duration is used for ripple offset
  useIncomingDuration: true
};

/**
 * Apply ripple or overwrite behavior when inserting a clip at a position.
 *
 * @param {Object} incoming - The clip being inserted
 * @param {Object} track - The target track
 * @param {Object} options
 * @returns {Object} { track, removed: [], modified: [], inserted }
 */
export function applyDropBehavior(incoming, track, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const removed = [];
  const modified = [];

  if (!incoming || !track) return { track, removed, modified, inserted: incoming };

  const items = Array.isArray(track.items) ? [...track.items] : [];
  const incomingStart = incoming.start || 0;
  const incomingEnd = incoming.end || (incomingStart + (incoming.sourceEnd || incoming.duration || 5));
  const incomingDuration = incomingEnd - incomingStart;

  if (opts.overwrite) {
    // Overwrite: remove any clips that overlap the new clip's range
    const kept = [];
    for (const item of items) {
      if (item.id === incoming.id) continue; // skip self
      const itemStart = item.start || 0;
      const itemEnd = item.end || itemStart;
      const overlaps = !(itemEnd <= incomingStart || itemStart >= incomingEnd);
      if (overlaps) {
        removed.push(item);
      } else {
        kept.push(item);
      }
    }
    track.items = [...kept, incoming];
    return { track, removed, modified, inserted: incoming };
  }

  if (opts.ripple) {
    // Ripple: insert and push all clips that start at or after incomingStart
    // forward by incomingDuration. Clips that overlap incomingStart are
    // also pushed (their content may be partially overwritten, but the
    // editor can decide that — default: push them entirely).
    const before = [];
    const after = [];
    for (const item of items) {
      if (item.id === incoming.id) continue;
      const itemStart = item.start || 0;
      if (itemStart < incomingStart) {
        before.push(item);
      } else {
        // Push forward
        const newStart = itemStart + incomingDuration;
        const duration = (item.end || 0) - itemStart;
        const updated = { ...item, start: newStart, end: newStart + duration };
        modified.push({ before: item, after: updated });
        after.push(updated);
      }
    }
    // Place incoming at incomingStart
    const inserted = { ...incoming, start: incomingStart, end: incomingEnd };
    track.items = [...before, inserted, ...after];
    return { track, removed, modified, inserted };
  }

  // Default: insert without modifying others (split if needed)
  const before = [];
  const after = [];
  for (const item of items) {
    if (item.id === incoming.id) continue;
    const itemStart = item.start || 0;
    const itemEnd = item.end || itemStart;
    // If existing clip is completely inside the incoming range, drop it
    if (itemStart >= incomingStart && itemEnd <= incomingEnd) {
      modified.push({ before: item, after: null, dropped: true });
      continue;
    }
    // If existing clip completely contains the incoming, skip insertion
    if (itemStart <= incomingStart && itemEnd >= incomingEnd) {
      // Keep the existing clip as-is, don't insert the incoming at this slot
      return { track, removed, modified, inserted: null, blocked: true };
    }
    if (itemEnd <= incomingStart) {
      before.push(item);
    } else if (itemStart >= incomingEnd) {
      after.push(item);
    } else {
      // Overlapping: split the existing item
      if (itemStart < incomingStart) {
        // Keep left part
        const left = { ...item, end: incomingStart };
        before.push(left);
        modified.push({ before: item, after: left });
      }
      if (itemEnd > incomingEnd) {
        // Keep right part
        const right = { ...item, start: incomingEnd };
        after.push(right);
        modified.push({ before: item, after: right });
      }
    }
  }
  const inserted = { ...incoming, start: incomingStart, end: incomingEnd };
  track.items = [...before, inserted, ...after];
  return { track, removed, modified, inserted };
}

/**
 * Move a clip to a new position on the same track (or different track).
 * Handles ripple/overwrite for the destination.
 *
 * @param {Object} clip - The clip being moved
 * @param {Object} targetTrack - The destination track
 * @param {Object} sourceTrack - The source track (may be same as target)
 * @param {Object} newPosition - { start, end, dropPercent }
 * @param {Object} options
 * @returns {Object} { sourceTrack, targetTrack, removed, modified, inserted }
 */
export function moveClip(clip, targetTrack, sourceTrack, newPosition, options = {}) {
  const result = { sourceTrack, targetTrack, removed: [], modified: [], inserted: null };
  if (!clip || !targetTrack) return result;

  const start = newPosition.start || 0;
  const duration = (clip.end || 0) - (clip.start || 0);
  const end = newPosition.end || (start + duration);
  const movedClip = { ...clip, start, end, sourceStart: clip.sourceStart || 0, sourceEnd: clip.sourceEnd || duration };

  // Remove from source track
  if (sourceTrack && sourceTrack !== targetTrack && Array.isArray(sourceTrack.items)) {
    const before = sourceTrack.items.length;
    sourceTrack.items = sourceTrack.items.filter(i => i.id !== clip.id);
    result.removed.push(clip);
  }

  // Apply drop behavior on target
  const dropResult = applyDropBehavior(movedClip, targetTrack, options);
  result.targetTrack = dropResult.track;
  result.modified = dropResult.modified;
  result.inserted = dropResult.inserted;
  return result;
}
