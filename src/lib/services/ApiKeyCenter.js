/**
 * ApiKeyCenter - Single source of truth for API key management.
 *
 * This is the ONLY module that should call apiKeyManager directly.
 * All other code must use ApiKeyCenter.getKey/setKey/hasKey so we have
 * one place that:
 *   - Knows which keys are configured
 *   - Broadcasts change events to the rest of the app
 *   - Exposes a single openApiKeyCenter() entry point for any UI
 *     that wants to prompt the user to add/update a key
 */
import { apiKeyManager } from '../apiKeyManager.js';

const KEY_EVENT = 'api-key-changed';

class ApiKeyCenterImpl {
  constructor() {
    this._knownKeys = new Set();
    this._cache = new Map();
  }

  async getKey(name = 'muapi') {
    if (this._cache.has(name)) return this._cache.get(name);
    const value = await apiKeyManager.getKey(name);
    if (value) this._cache.set(name, value);
    return value || null;
  }

  async setKey(value, name = 'muapi') {
    await apiKeyManager.setKey(value, name);
    this._cache.set(name, value);
    this._knownKeys.add(name);
    this._broadcast(name);
  }

  async hasKey(name = 'muapi') {
    const v = await this.getKey(name);
    return !!v;
  }

  async clearKey(name = 'muapi') {
    await apiKeyManager.clearKey(name);
    this._cache.delete(name);
    this._knownKeys.delete(name);
    this._broadcast(name);
  }

  onChange(handler) {
    const wrapped = (e) => handler(e.detail);
    window.addEventListener(KEY_EVENT, wrapped);
    return () => window.removeEventListener(KEY_EVENT, wrapped);
  }

  _broadcast(name) {
    window.dispatchEvent(new CustomEvent(KEY_EVENT, { detail: { name } }));
  }
}

export const apiKeyCenter = new ApiKeyCenterImpl();

let openModalFn = null;

export function registerApiKeyCenterModal(openFn) {
  openModalFn = openFn;
}

/**
 * Open the single, centralized API key modal.
 * If a key is already set for the given name, the modal opens in "manage" mode.
 * Otherwise it opens in "add" mode with a focus on adding the key.
 */
export function openApiKeyCenter(opts = {}) {
  if (openModalFn) {
    openModalFn({ name: opts.name || 'muapi', mode: opts.mode });
    return;
  }
  // Fallback: dynamic import so the modal code is code-split
  import('../../components/modals/ApiKeyCenterModal.jsx').then((mod) => {
    openModalFn = mod.openApiKeyCenterModal;
    openModalFn({ name: opts.name || 'muapi', mode: opts.mode });
    registerApiKeyCenterModal(openModalFn);
  });
}
