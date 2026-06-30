import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveProject,
  saveProjectSync,
  loadProject,
  restoreVersion,
  listVersions,
  createAutosave,
  saveProjectToStorage,
  loadProjectFromStorage,
  wrapVersioned,
  unwrapVersioned,
  migrate
} from '../../src/lib/editor/persistence.js';

describe('Persistence — version envelope', () => {
  it('wrapVersioned adds version and timestamp', () => {
    const v = wrapVersioned({ a: 1 });
    expect(v.__version).toBe(2);
    expect(v.__savedAt).toBeDefined();
    expect(v.data).toEqual({ a: 1 });
  });

  it('unwrapVersioned reads versioned payload', () => {
    const v = wrapVersioned({ a: 1 });
    const r = unwrapVersioned(v);
    expect(r.version).toBe(2);
    expect(r.data).toEqual({ a: 1 });
  });

  it('unwrapVersioned handles legacy unwrapped payload as v1', () => {
    const r = unwrapVersioned({ a: 1 });
    expect(r.version).toBe(1);
    expect(r.data).toEqual({ a: 1 });
  });
});

describe('Persistence — migrate', () => {
  it('migrate is a no-op for current version', () => {
    const p = { tracks: [] };
    const r = migrate(p, 2);
    expect(r).toBe(p);
  });

  it('migrate handles v1 (no transforms registered, returns as-is)', () => {
    const p = { tracks: [{ clips: [] }] };
    const r = migrate(p, 1);
    expect(r.tracks[0].clips).toBeDefined();
  });
});

describe('Persistence — saveProjectSync / saveProjectToStorage', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear();
  });

  it('saves to localStorage under v2 key', () => {
    const state = { projectTitle: 'Test', tracks: [] };
    const ok = saveProjectSync(state);
    expect(ok).toBe(true);
    const raw = localStorage.getItem('timeline-editor-project-v2');
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw);
    expect(parsed.__version).toBe(2);
    expect(parsed.data.projectTitle).toBe('Test');
  });

  it('saves to legacy key for backwards compat', () => {
    const state = { projectTitle: 'Legacy Test', tracks: [] };
    saveProjectSync(state);
    const raw = localStorage.getItem('timeline-editor-project');
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw);
    expect(parsed.projectTitle).toBe('Legacy Test');
  });

  it('strips non-serializable fields', () => {
    const state = {
      projectTitle: 'Test',
      keyframeSystem: { foo: 'bar' }, // should be stripped
      transitionEditor: { fn: () => {} }, // should be stripped
      runtimeSubscriptions: [{ x: 1 }] // should be stripped
    };
    saveProjectSync(state);
    const raw = JSON.parse(localStorage.getItem('timeline-editor-project-v2'));
    expect(raw.data.projectTitle).toBe('Test');
    expect(raw.data.keyframeSystem).toBeUndefined();
    expect(raw.data.transitionEditor).toBeUndefined();
    expect(raw.data.runtimeSubscriptions).toBeUndefined();
  });

  it('strips undefined values', () => {
    const state = { projectTitle: 'Test', foo: undefined };
    saveProjectSync(state);
    const raw = JSON.parse(localStorage.getItem('timeline-editor-project-v2'));
    expect('foo' in raw.data).toBe(false);
  });

  it('strips functions from nested objects', () => {
    const state = { project: { fps: 30, fn: () => 'hello' } };
    saveProjectSync(state);
    const raw = JSON.parse(localStorage.getItem('timeline-editor-project-v2'));
    expect(raw.data.project.fps).toBe(30);
    expect(raw.data.project.fn).toBeUndefined();
  });

  it('saveProjectToStorage alias works (backwards compat)', () => {
    const state = { projectTitle: 'Alias Test' };
    const ok = saveProjectToStorage(state);
    expect(ok).toBe(true);
    const raw = localStorage.getItem('timeline-editor-project-v2');
    expect(raw).toBeDefined();
  });
});

describe('Persistence — loadProjectFromStorage', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear();
  });

  it('returns null when nothing stored', () => {
    expect(loadProjectFromStorage()).toBe(null);
  });

  it('loads from v2 key', () => {
    localStorage.setItem('timeline-editor-project-v2', JSON.stringify({
      __version: 2,
      __savedAt: '2026-06-30T00:00:00Z',
      data: { projectTitle: 'Loaded' }
    }));
    const state = loadProjectFromStorage();
    expect(state).toBeDefined();
    expect(state.projectTitle).toBe('Loaded');
  });

  it('loads from legacy key (v1)', () => {
    localStorage.setItem('timeline-editor-project', JSON.stringify({
      projectTitle: 'Legacy Loaded'
    }));
    const state = loadProjectFromStorage();
    expect(state).toBeDefined();
    expect(state.projectTitle).toBe('Legacy Loaded');
  });

  it('loads from state key (TimelineState._persist)', () => {
    localStorage.setItem('timeline-state', JSON.stringify({
      project: { fps: 30, tracks: [] }
    }));
    const state = loadProjectFromStorage();
    expect(state).toBeDefined();
    expect(state.project.fps).toBe(30);
  });
});

describe('Persistence — saveProject (async, all backends)', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear();
  });

  it('returns localStorage success', async () => {
    const r = await saveProject({ projectTitle: 'Async', tracks: [] });
    expect(r.localStorage).toBe(true);
    // indexedDB may be false in test env (no working IDB) — we just check it doesn't throw
    const idbResult = await r.indexedDB;
    expect(typeof idbResult).toBe('boolean');
  });

  it('strips before saving', async () => {
    await saveProject({
      projectTitle: 'X',
      keyframeSystem: { should: 'be stripped' }
    });
    const raw = JSON.parse(localStorage.getItem('timeline-editor-project-v2'));
    expect(raw.data.keyframeSystem).toBeUndefined();
  });
});

describe('Persistence — version history', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear();
  });

  it('pushes version to history on save', async () => {
    await saveProject({ projectTitle: 'V1' });
    const versions = listVersions();
    expect(versions.length).toBeGreaterThan(0);
    expect(versions[0].version).toBe(2);
  });

  it('restores from version history', async () => {
    await saveProject({ projectTitle: 'Original' });
    await new Promise(r => setTimeout(r, 10));
    await saveProject({ projectTitle: 'Updated' });
    const versions = listVersions();
    expect(versions.length).toBe(2);
    const oldest = restoreVersion(versions.length - 1);
    expect(oldest).toBeDefined();
  });

  it('rotates history to max 10 versions', async () => {
    for (let i = 0; i < 15; i++) {
      await saveProject({ projectTitle: `V${i}` });
      await new Promise(r => setTimeout(r, 1));
    }
    const versions = listVersions();
    expect(versions.length).toBeLessThanOrEqual(10);
  });
});

describe('Persistence — autosave', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces saves', () => {
    const autosave = createAutosave({ debounceMs: 100 });
    autosave.schedule({ projectTitle: 'A' });
    autosave.schedule({ projectTitle: 'B' });
    autosave.schedule({ projectTitle: 'C' });
    expect(localStorage.getItem('timeline-editor-project-v2')).toBe(null);
    vi.advanceTimersByTime(150);
    const raw = JSON.parse(localStorage.getItem('timeline-editor-project-v2'));
    expect(raw.data.projectTitle).toBe('C');
  });

  it('flush forces immediate save', () => {
    const autosave = createAutosave({ debounceMs: 10000 });
    autosave.schedule({ projectTitle: 'Pending' });
    autosave.flush();
    const raw = JSON.parse(localStorage.getItem('timeline-editor-project-v2'));
    expect(raw.data.projectTitle).toBe('Pending');
  });

  it('cancel prevents pending save', () => {
    const autosave = createAutosave({ debounceMs: 100 });
    autosave.schedule({ projectTitle: 'Canceled' });
    autosave.cancel();
    vi.advanceTimersByTime(150);
    expect(localStorage.getItem('timeline-editor-project-v2')).toBe(null);
  });

  it('does not save if state unchanged (dedup)', async () => {
    const onSave = vi.fn();
    const autosave = createAutosave({ debounceMs: 50, onSave });
    autosave.schedule({ projectTitle: 'Same' });
    vi.advanceTimersByTime(100);
    // Flush executes the pending save synchronously enough for the callback to fire.
    await autosave.flush();
    expect(onSave).toHaveBeenCalledTimes(1);

    // Now reschedule the same state. Dedup should prevent a second save.
    autosave.schedule({ projectTitle: 'Same' });
    await autosave.flush();
    expect(onSave).toHaveBeenCalledTimes(1); // still 1
  });
});
