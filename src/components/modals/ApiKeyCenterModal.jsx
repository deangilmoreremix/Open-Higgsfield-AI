/**
 * ApiKeyCenterModal - The single, central UI for entering and managing API keys.
 *
 * This is the ONLY place in the app where a user types in an API key. Every
 * other entry point (Settings page, legacy SettingsModal, AuthModal, etc.)
 * opens this modal so we have a single source of truth.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { apiKeyCenter, registerApiKeyCenterModal } from '../../lib/services/ApiKeyCenter.js';

function ApiKeyCenterModalInner({ initialName = 'muapi', initialMode, onClose }) {
  const [name] = useState(initialName);
  const [value, setValue] = useState('');
  const [savedValue, setSavedValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showValue, setShowValue] = useState(false);
  const [mode, setMode] = useState(initialMode || 'add');

  useEffect(() => {
    let mounted = true;
    apiKeyCenter.getKey(name).then((k) => {
      if (!mounted) return;
      if (k) {
        setSavedValue(k);
        setMode('manage');
      }
    });
    return () => { mounted = false; };
  }, [name]);

  const handleSave = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Please enter an API key.');
      return;
    }
    if (trimmed.length < 10) {
      setError('API key looks too short. Please double-check and try again.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await apiKeyCenter.setKey(trimmed, name);
      setSavedValue(trimmed);
      setValue('');
      setMode('manage');
    } catch (e) {
      setError(e?.message || 'Failed to save API key.');
    } finally {
      setSaving(false);
    }
  }, [value, name]);

  const handleRemove = useCallback(async () => {
    setSaving(true);
    try {
      await apiKeyCenter.clearKey(name);
      setSavedValue('');
      setValue('');
      setMode('add');
    } catch (e) {
      setError(e?.message || 'Failed to remove API key.');
    } finally {
      setSaving(false);
    }
  }, [name]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape' && onClose) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm px-6"
      data-testid="api-key-center-modal"
      onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
    >
      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-8 shadow-3xl animate-fade-in-up">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-glow mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d9ff00" stroke-width="2">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3m-3-3l-2.25-2.25" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
            {mode === 'manage' ? 'API Key Saved' : 'Add Your API Key'}
          </h2>
          <p className="text-secondary text-sm">
            {mode === 'manage'
              ? 'Your Muapi API key is saved locally. You can update or remove it below.'
              : 'Add your Muapi API key to start generating videos, images, and more.'}
          </p>
        </div>

        <div className="space-y-6">
          {mode === 'manage' ? (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">
                Current Key
              </label>
              <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-2xl px-5 py-4">
                <span className="flex-1 font-mono text-white text-sm truncate">
                  {showValue ? savedValue : '••••••••••••••••' + (savedValue ? savedValue.slice(-4) : '')}
                </span>
                <button
                  type="button"
                  onClick={() => setShowValue((v) => !v)}
                  className="text-muted hover:text-white text-xs font-bold uppercase tracking-wider"
                >
                  {showValue ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted uppercase tracking-widest ml-1">
              {mode === 'manage' ? 'Replace With New Key' : 'Your API Key'}
            </label>
            <input
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your Muapi API key..."
              autoFocus
              data-testid="api-key-center-input"
              className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors shadow-inner"
            />
          </div>

          {error ? (
            <div className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3" data-testid="api-key-center-error">
              {error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              data-testid="api-key-center-save"
              className="w-full bg-primary text-black font-black py-4 rounded-2xl hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving…' : mode === 'manage' ? 'Update Key' : 'Save Key & Continue'}
            </button>

            {mode === 'manage' ? (
              <button
                type="button"
                onClick={handleRemove}
                disabled={saving}
                className="w-full bg-transparent border border-red-500/30 text-red-400 font-bold py-3 rounded-2xl hover:bg-red-500/10 transition-all text-xs uppercase tracking-wider"
              >
                Remove API Key
              </button>
            ) : null}

            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="text-center text-[11px] font-bold text-muted hover:text-white transition-colors py-2 uppercase tracking-tighter"
              >
                {mode === 'manage' ? 'Close' : 'Maybe Later'}
              </button>
            ) : null}

            <a
              href="https://muapi.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-center text-[11px] font-bold text-muted hover:text-white transition-colors py-1 uppercase tracking-tighter"
            >
              Get an API Key at Muapi.ai →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function openApiKeyCenterModal(opts = {}) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  let closed = false;
  let savedDuringSession = false;

  const close = () => {
    if (closed) return;
    closed = true;
    try {
      root.unmount();
    } catch (_) { /* ignore */ }
    if (container.parentNode) container.parentNode.removeChild(container);
    window.removeEventListener('api-key-changed', onChanged);
    if (!savedDuringSession) {
      import('../../lib/services/ApiKeyPrompt.js').then(({ markApiKeyPromptDismissed }) => {
        markApiKeyPromptDismissed();
      }).catch(() => { /* ignore */ });
    }
  };

  // Listen for the key-change event so we know if the user actually saved
  const onChanged = (e) => {
    if (e?.detail?.name === (opts.name || 'muapi')) {
      savedDuringSession = true;
      window.removeEventListener('api-key-changed', onChanged);
    }
  };
  window.addEventListener('api-key-changed', onChanged);

  root.render(
    <ApiKeyCenterModalInner
      initialName={opts.name || 'muapi'}
      initialMode={opts.mode}
      onClose={close}
    />
  );

  return { close };
}

registerApiKeyCenterModal(openApiKeyCenterModal);

export default openApiKeyCenterModal;
