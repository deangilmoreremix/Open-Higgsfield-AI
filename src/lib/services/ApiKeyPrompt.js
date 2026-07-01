/**
 * ApiKeyPrompt - Nudges users to add their API key after they've spent
 * 90 seconds on the site without one.
 *
 * Behavior (per the design):
 *   - Starts a 90s timer when the app shell is mounted
 *   - Fires the prompt ONCE if no muapi key is configured at that time
 *   - If the user dismisses without adding a key, never re-prompts in that
 *     session (tracked via sessionStorage so a hard refresh resets it)
 *   - Once a key is added, the prompt is permanently disabled
 *   - Listens to apiKeyCenter change events and self-disables when a key lands
 */

const PROMPT_DELAY_MS = 90 * 1000;
const DISMISSED_FLAG = 'apiKeyPrompt:dismissed';
const HAS_KEY_FLAG = 'apiKeyPrompt:hasKey';

let timer = null;
let started = false;

function hasKey() {
  try {
    return localStorage.getItem(HAS_KEY_FLAG) === '1';
  } catch (_) {
    return false;
  }
}

function markHasKey() {
  try {
    localStorage.setItem(HAS_KEY_FLAG, '1');
  } catch (_) { /* ignore */ }
}

function isDismissed() {
  try {
    return sessionStorage.getItem(DISMISSED_FLAG) === '1';
  } catch (_) {
    return false;
  }
}

function markDismissed() {
  try {
    sessionStorage.setItem(DISMISSED_FLAG, '1');
  } catch (_) { /* ignore */ }
}

function clearTimer() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

async function maybeFirePrompt() {
  if (hasKey() || isDismissed()) return;
  // Import lazily so we don't pull React into the initial bundle path
  const { openApiKeyCenter } = await import('./ApiKeyCenter.js');
  openApiKeyCenter({ name: 'muapi', mode: 'add' });
}

function onKeyChanged(e) {
  if (e?.detail?.name === 'muapi') {
    markHasKey();
    clearTimer();
  }
}

export function startApiKeyPrompt() {
  if (started) return;
  started = true;

  // Short-circuit if we already know the user has a key
  if (hasKey()) return;

  window.addEventListener('api-key-changed', onKeyChanged);

  timer = setTimeout(() => {
    timer = null;
    // Wrap in a try/catch in case the dynamic import or DOM is not ready
    maybeFirePrompt().catch((err) => {
      console.warn('[ApiKeyPrompt] Failed to fire prompt:', err);
    });
  }, PROMPT_DELAY_MS);
}

export function stopApiKeyPrompt() {
  clearTimer();
  window.removeEventListener('api-key-changed', onKeyChanged);
  started = false;
}

export function markApiKeyPromptDismissed() {
  markDismissed();
}

export function _resetForTests() {
  stopApiKeyPrompt();
  try {
    sessionStorage.removeItem(DISMISSED_FLAG);
    localStorage.removeItem(HAS_KEY_FLAG);
  } catch (_) { /* ignore */ }
}
