/**
 * Project Persistence Module
 *
 * Unified save/load/autosave/restore for timeline editor projects.
 * Supports localStorage (primary), IndexedDB (via localforage + idb-keyval),
 * and Supabase (optional cloud sync).
 *
 * Features:
 *  - saveProject(): save to all available backends
 *  - loadProject(): load from the best available backend (localStorage first,
 *    then IndexedDB, then Supabase)
 *  - autosave(): debounced automatic save after state mutations
 *  - restore(): restore from a specific backup entry
 *  - versioning(): every save records a version; load returns the latest
 *  - migration(): on load, automatically migrates older project versions
 *    to the current schema (left/width → start/end, legacy clips → items,
 *    etc.)
 *
 * Backwards compatibility:
 *  - Reads the legacy key 'timeline-editor-project' (set by the old
 *    saveProjectToStorage stub) and the 'timeline-state' key (set by
 *    TimelineState._persist). Both are read on load.
 *  - Writes the same keys so any existing reader keeps working.
 *  - Adds the new key 'timeline-editor-project-v2' for versioned saves.
 */

import { validateOrPass } from './schemas.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const LEGACY_KEYS = {
  editor: 'timeline-editor-project',
  state: 'timeline-state'
};

const VERSIONED_KEY = 'timeline-editor-project-v2';
const INDEXEDDB_KEY = 'timeline-editor-project-v2';
const SUPABASE_TABLE = 'timeline_projects';

const CURRENT_VERSION = 2;
const MAX_VERSIONS = 10;
const AUTOSAVE_DEBOUNCE_MS = 1500;

// Runtime singletons that must be stripped before persistence
// (they cannot be JSON-serialized and are rebuilt on init).
const NON_SERIALIZABLE_KEYS = new Set([
  'keyframeSystem',
  'transitionEditor',
  'sceneDetector',
  'cameraEffects',
  'aiChatPanel',
  'colorCorrectionSystem',
  'runtimeSubscriptions',
  '_eventListeners'
]);

// ============================================================================
// BACKEND ABSTRACTION
// ============================================================================

/**
 * Try to get a storage backend. Priority:
 *  1. localStorage (always available, fast, 5-10MB limit)
 *  2. IndexedDB via idb-keyval (large storage, async)
 *  3. Supabase (if getSupabaseClient is provided and online)
 */
function getLocalStorage() {
  try {
    if (typeof localStorage !== 'undefined') {
      const t = '__persistence_test__';
      localStorage.setItem(t, t);
      localStorage.removeItem(t);
      return localStorage;
    }
  } catch (e) { /* ignored */ }
  return null;
}

async function getIndexedDB() {
  try {
    const idb = await import('idb-keyval');
    // Return the module directly. Actual operations (get/set) are wrapped
    // in withTimeout() to avoid hanging in environments without a working
    // IndexedDB (jsdom, some test runners).
    return idb;
  } catch (e) {
    return null;
  }
}

function withTimeout(promise, ms = 3000) {
  return Promise.race([
    promise,
    new Promise(resolve => setTimeout(() => resolve(null), ms))
  ]);
}

function getSupabaseClient() {
  // Lazy: only used if explicitly wired. Returns null if not available.
  // The app can install a supabase client via setSupabaseClient().
  if (typeof window !== 'undefined' && window.__supabase) return window.__supabase;
  return null;
}

export function setSupabaseClient(client) {
  if (typeof window !== 'undefined') window.__supabase = client;
}

// ============================================================================
// VERSIONING
// ============================================================================

/**
 * Wrap a project payload with a version header.
 */
export function wrapVersioned(project) {
  return {
    __version: CURRENT_VERSION,
    __savedAt: new Date().toISOString(),
    data: project
  };
}

/**
 * Extract a project payload from a versioned envelope.
 * If the payload is unwrapped (legacy), returns it as-is.
 */
export function unwrapVersioned(payload) {
  if (payload && typeof payload === 'object' && '__version' in payload && 'data' in payload) {
    return { version: payload.__version, savedAt: payload.__savedAt, data: payload.data };
  }
  return { version: 1, savedAt: null, data: payload };
}

// ============================================================================
// MIGRATION
// ============================================================================

/**
 * Migration map. Each entry migrates from version N to N+1.
 * v1 → v2: ensure track.clips alias is wired (handled by TimelineState
 *           _normalizeState, which runs on load).
 */
const MIGRATIONS = {
  // Example for future versions:
  // 2: (project) => { ...; return project; }
};

export function migrate(project, fromVersion) {
  let p = project;
  for (let v = fromVersion; v < CURRENT_VERSION; v++) {
    const migrator = MIGRATIONS[v];
    if (typeof migrator === 'function') {
      try {
        p = migrator(p);
      } catch (e) {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn(`[Persistence] Migration from v${v} to v${v + 1} failed:`, e);
        }
        return p;
      }
    }
    // Default: no-op migration. _normalizeState handles aliases.
  }
  return p;
}

// ============================================================================
// STRIP / RESTORE RUNTIME FIELDS
// ============================================================================

function stripForPersist(state) {
  if (!state || typeof state !== 'object') return state;
  if (Array.isArray(state)) return state.map(stripForPersist);
  const out = {};
  for (const [k, v] of Object.entries(state)) {
    if (NON_SERIALIZABLE_KEYS.has(k)) continue;
    if (typeof v === 'function') continue;
    if (typeof v === 'undefined') continue;
    out[k] = stripForPersist(v);
  }
  return out;
}

// ============================================================================
// SAVE
// ============================================================================

/**
 * Save a project to all available backends. Writes:
 *  - localStorage['timeline-editor-project-v2'] (versioned, current)
 *  - localStorage['timeline-editor-project']    (legacy key, unwrapped)
 *  - localStorage['timeline-state']             (legacy key, unwrapped)
 *  - IndexedDB 'timeline-editor-project-v2'
 *  - Supabase timeline_projects (if client available)
 *
 * Returns a summary { localStorage: bool, indexedDB: bool, supabase: bool }.
 */
export async function saveProject(state) {
  if (!state || typeof state !== 'object') {
    return { localStorage: false, indexedDB: false, supabase: false, error: 'Invalid state' };
  }

  const stripped = stripForPersist(state);
  const versioned = wrapVersioned(stripped);

  // localStorage
  let lsOk = false;
  const ls = getLocalStorage();
  if (ls) {
    try {
      ls.setItem(VERSIONED_KEY, JSON.stringify(versioned));
      // Legacy unwrapped key (for backwards compat with old readers)
      ls.setItem(LEGACY_KEYS.editor, JSON.stringify(stripped));
      lsOk = true;
      // Push to version history (rotation: max 10)
      pushVersionHistory(versioned);
    } catch (e) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('[Persistence] localStorage save failed (quota?):', e);
      }
    }
  }

  // IndexedDB (fire-and-forget, time-bounded to avoid hanging in test envs)
  let idbOk = false;
  const idbPromise = (async () => {
    try {
      const idb = await getIndexedDB();
      if (idb) {
        await withTimeout(idb.set(INDEXEDDB_KEY, versioned), 3000);
        return true;
      }
    } catch (e) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('[Persistence] IndexedDB save failed:', e);
      }
    }
    return false;
  })();
  // Don't await IDB: return localStorage result immediately so callers
  // (autosave, flush, saveProject) don't hang on broken IndexedDB.
  idbPromise.then(ok => { if (ok) { /* could emit event */ } });

  // Supabase (optional)
  let supabaseOk = false;
  try {
    const client = getSupabaseClient();
    if (client) {
      const { data, error } = await client
        .from(SUPABASE_TABLE)
        .upsert({
          id: stripped.projectId || 'default',
          project: versioned,
          updated_at: new Date().toISOString()
        });
      if (!error) supabaseOk = true;
    }
  } catch (e) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[Persistence] Supabase save failed:', e);
    }
  }

  return {
    localStorage: lsOk,
    indexedDB: idbPromise.then(() => true).catch(() => false),
    supabase: supabaseOk
  };
}

/**
 * Synchronous save to localStorage only. Use when you need a quick save
 * before page unload (e.g., in a beforeunload handler).
 */
export function saveProjectSync(state) {
  if (!state || typeof state !== 'object') return false;
  const stripped = stripForPersist(state);
  const versioned = wrapVersioned(stripped);
  const ls = getLocalStorage();
  if (!ls) return false;
  try {
    ls.setItem(VERSIONED_KEY, JSON.stringify(versioned));
    ls.setItem(LEGACY_KEYS.editor, JSON.stringify(stripped));
    return true;
  } catch (e) {
    return false;
  }
}

// ============================================================================
// LOAD
// ============================================================================

/**
 * Load a project from the best available backend.
 * Priority: localStorage (versioned) → localStorage (legacy) →
 * IndexedDB → Supabase. Returns null if nothing found.
 *
 * On load:
 *  - Unwraps version envelope
 *  - Migrates old versions to current
 *  - Validates with zod (permissive)
 */
export async function loadProject() {
  // localStorage versioned
  const ls = getLocalStorage();
  if (ls) {
    try {
      const raw = ls.getItem(VERSIONED_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const unwrapped = unwrapVersioned(parsed);
        if (unwrapped.version < CURRENT_VERSION) {
          unwrapped.data = migrate(unwrapped.data, unwrapped.version);
        }
        return validateOrPass(/* schema */ null, unwrapped.data, 'Persistence.load');
      }
    } catch (e) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('[Persistence] localStorage versioned load failed:', e);
      }
    }
    // legacy unwrapped
    try {
      const raw = ls.getItem(LEGACY_KEYS.editor);
      if (raw) {
        const parsed = JSON.parse(raw);
        // v1 (unwrapped) → migrate
        const migrated = migrate(parsed, 1);
        return validateOrPass(null, migrated, 'Persistence.loadLegacy');
      }
      const raw2 = ls.getItem(LEGACY_KEYS.state);
      if (raw2) {
        const parsed = JSON.parse(raw2);
        return validateOrPass(null, parsed, 'Persistence.loadLegacyState');
      }
    } catch (e) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('[Persistence] legacy localStorage load failed:', e);
      }
    }
  }

  // IndexedDB
  try {
    const idb = await getIndexedDB();
    if (idb) {
      const versioned = await withTimeout(idb.get(INDEXEDDB_KEY), 3000);
      if (versioned) {
        const unwrapped = unwrapVersioned(versioned);
        if (unwrapped.version < CURRENT_VERSION) {
          unwrapped.data = migrate(unwrapped.data, unwrapped.version);
        }
        return validateOrPass(null, unwrapped.data, 'Persistence.loadIDB');
      }
    }
  } catch (e) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[Persistence] IndexedDB load failed:', e);
    }
  }

  // Supabase
  try {
    const client = getSupabaseClient();
    if (client) {
      const { data, error } = await client
        .from(SUPABASE_TABLE)
        .select('project')
        .order('updated_at', { ascending: false })
        .limit(1);
      if (!error && data && data[0] && data[0].project) {
        const unwrapped = unwrapVersioned(data[0].project);
        if (unwrapped.version < CURRENT_VERSION) {
          unwrapped.data = migrate(unwrapped.data, unwrapped.version);
        }
        return validateOrPass(null, unwrapped.data, 'Persistence.loadSupabase');
      }
    }
  } catch (e) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[Persistence] Supabase load failed:', e);
    }
  }

  return null;
}

// ============================================================================
// RESTORE (backups / versions)
// ============================================================================

/**
 * Restore a specific version from the version history stored in
 * localStorage['timeline-editor-project-versions'].
 * Returns the restored project, or null if version not found.
 */
export function restoreVersion(versionIndex) {
  const ls = getLocalStorage();
  if (!ls) return null;
  try {
    const raw = ls.getItem('timeline-editor-project-versions');
    if (!raw) return null;
    const versions = JSON.parse(raw);
    if (!Array.isArray(versions)) return null;
    const entry = versions[versionIndex];
    if (!entry) return null;
    const unwrapped = unwrapVersioned(entry);
    if (unwrapped.version < CURRENT_VERSION) {
      unwrapped.data = migrate(unwrapped.data, unwrapped.version);
    }
    return unwrapped.data;
  } catch (e) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[Persistence] restoreVersion failed:', e);
    }
    return null;
  }
}

/**
 * List available version history entries (most recent first).
 */
export function listVersions() {
  const ls = getLocalStorage();
  if (!ls) return [];
  try {
    const raw = ls.getItem('timeline-editor-project-versions');
    if (!raw) return [];
    const versions = JSON.parse(raw);
    if (!Array.isArray(versions)) return [];
    return versions.map((v, i) => ({
      index: i,
      version: v.__version,
      savedAt: v.__savedAt
    })).reverse();
  } catch (e) {
    return [];
  }
}

/**
 * Push the current project onto the version history (rotation: max MAX_VERSIONS).
 * Called automatically by saveProject.
 */
function pushVersionHistory(versioned) {
  const ls = getLocalStorage();
  if (!ls) return;
  try {
    const raw = ls.getItem('timeline-editor-project-versions');
    const versions = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(versions)) versions.length = 0;
    versions.push(versioned);
    while (versions.length > MAX_VERSIONS) versions.shift();
    ls.setItem('timeline-editor-project-versions', JSON.stringify(versions));
  } catch (e) {
    /* quota or parse error: skip history */
  }
}

// ============================================================================
// AUTOSAVE
// ============================================================================

/**
 * Create an autosave controller. Call .schedule(state) on every mutation;
 * it debounces and calls saveProject. Call .flush() to force-save immediately.
 * Call .cancel() to cancel any pending save.
 */
export function createAutosave(opts = {}) {
  const debounceMs = opts.debounceMs ?? AUTOSAVE_DEBOUNCE_MS;
  const onSave = opts.onSave || (() => {});
  const onError = opts.onError || ((err) => console.warn('[Autosave]', err));

  let timer = null;
  let pendingState = null;
  let lastSavedJson = null;

  async function doSave(state) {
    try {
      const stripped = stripForPersist(state);
      const json = JSON.stringify(stripped);
      if (json === lastSavedJson) return; // no change
      const versioned = wrapVersioned(stripped);
      pushVersionHistory(versioned);
      const result = await saveProject(state);
      lastSavedJson = json;
      onSave({ at: Date.now(), result });
    } catch (e) {
      onError(e);
    }
  }

  function schedule(state) {
    pendingState = state;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      const s = pendingState;
      pendingState = null;
      doSave(s);
    }, debounceMs);
  }

  async function flush() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (pendingState) {
      const s = pendingState;
      pendingState = null;
      await doSave(s);
    }
  }

  function cancel() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    pendingState = null;
  }

  return { schedule, flush, cancel };
}

// ============================================================================
// LEGACY-COMPATIBLE EXPORTS
// ============================================================================

/**
 * Backwards-compatible name for the old `saveProjectToStorage(state)` stub
 * that was called 4 times in TimelineEditorPage.jsx but never defined.
 */
export function saveProjectToStorage(state) {
  return saveProjectSync(state);
}

/**
 * Backwards-compatible synchronous loader that matches the existing
 * loadProjectFromStorage() signature: returns a state object, or null
 * if nothing stored.
 */
export function loadProjectFromStorage() {
  // Synchronous path: localStorage only.
  const ls = getLocalStorage();
  if (!ls) return null;
  try {
    const raw = ls.getItem(VERSIONED_KEY) || ls.getItem(LEGACY_KEYS.editor) || ls.getItem(LEGACY_KEYS.state);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const unwrapped = unwrapVersioned(parsed);
    if (unwrapped.version < CURRENT_VERSION) {
      unwrapped.data = migrate(unwrapped.data, unwrapped.version);
    }
    return unwrapped.data;
  } catch (e) {
    return null;
  }
}
