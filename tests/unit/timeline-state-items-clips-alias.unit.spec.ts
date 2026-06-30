import { describe, it, expect, beforeEach } from 'vitest';
import { TimelineState } from '../../src/lib/editor/TimelineState.js';

describe('TimelineState — track.clips / track.items alias', () => {
  let ts;

  beforeEach(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear();
    ts = new TimelineState({ autopersist: false });
  });

  it('default state uses track.items as canonical', () => {
    const state = ts.getRawState();
    expect(state.project.tracks.length).toBeGreaterThan(0);
    for (const track of state.project.tracks) {
      expect(Array.isArray(track.items)).toBe(true);
      expect(track.clips).toBe(track.items);
    }
  });

  it('writes via track.clips.push are visible through track.items', () => {
    const state = ts.getRawState();
    const track = state.project.tracks[0];
    const before = track.items.length;
    track.clips.push({ id: 'item_test_1', start: 0, end: 5, type: 'video', name: 't' });
    expect(track.items.length).toBe(before + 1);
    expect(track.items[track.items.length - 1].id).toBe('item_test_1');
  });

  it('writes via track.items.push are visible through track.clips', () => {
    const state = ts.getRawState();
    const track = state.project.tracks[0];
    const before = track.clips.length;
    track.items.push({ id: 'item_test_2', start: 0, end: 5, type: 'audio', name: 'a' });
    expect(track.clips.length).toBe(before + 1);
    expect(track.clips[track.clips.length - 1].id).toBe('item_test_2');
  });

  it('mutations through track.clips.sort persist on track.items', () => {
    const state = ts.getRawState();
    const track = state.project.tracks[0];
    track.items.push({ id: 'b', start: 10, end: 12, type: 'video', name: 'b' });
    track.items.push({ id: 'a', start: 1, end: 2, type: 'video', name: 'a' });
    track.clips.sort((a, b) => (a.start ?? 0) - (b.start ?? 0));
    const sortedIds = track.items.filter(i => typeof i.id === 'string').map(i => i.id).sort();
    expect(sortedIds).toEqual(['a', 'b']);
    expect(track.items[0].id).toBe('a');
  });

  it('legacy state with only track.clips is promoted to track.items on normalize', () => {
    const state = ts.getRawState();
    const track = state.project.tracks[0];
    const legacyClips = [{ id: 'c1', left: 8, width: 18, type: 'video' }];
    track.items = null;
    track.clips = legacyClips;
    ts.setState({ playheadPercent: 50 });
    expect(Array.isArray(track.items)).toBe(true);
    expect(track.items.length).toBe(1);
    expect(track.items[0].id).toBe('c1');
    expect(track.clips).toBe(track.items);
  });

  it('track with neither clips nor items gets both as empty arrays', () => {
    const state = ts.getRawState();
    const track = state.project.tracks[0];
    track.items = undefined;
    track.clips = undefined;
    ts.setState({ playheadPercent: 50 });
    expect(Array.isArray(track.items)).toBe(true);
    expect(track.items.length).toBe(0);
    expect(track.clips).toBe(track.items);
  });

  it('alias holds after setState (re-normalization)', () => {
    const state = ts.getRawState();
    const track = state.project.tracks[0];
    const ref = track.items;
    ts.setState({ playheadPercent: 50 });
    expect(track.clips).toBe(track.items);
    expect(track.clips).toBe(ref);
  });
});
