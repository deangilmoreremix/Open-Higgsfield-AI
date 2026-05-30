'use client';

import { useState, useEffect } from 'react';
import { securityService } from '../../src/lib/services/SecurityService';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [stored, setStored] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    securityService.getDecryptedKey().then(key => {
      if (key) {
        setApiKey(key);
        setStored(true);
      }
    });
  }, []);

  const handleSave = async () => {
    if (!apiKey) return;
    setIsSaving(true);
    try {
      await securityService.storeEncryptedKey(apiKey);
      setStored(true);
    } catch (err) {
      console.error('Failed to save key:', err);
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">MuAPI API Key</h2>
          <p className="text-sm text-white/60 mb-4">
            Your API key is encrypted and stored locally in your browser.
          </p>
          <div className="space-y-4">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your MuAPI API key"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50"
            />
            <button
              onClick={handleSave}
              disabled={!apiKey || isSaving}
              className="w-full py-3 bg-primary text-black rounded-lg font-bold hover:opacity-90 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : stored ? 'Update Key' : 'Save Key'}
            </button>
            {stored && (
              <p className="text-xs text-primary">✓ API key saved securely</p>
            )}
          </div>
        </div>
        
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <p className="text-sm text-white/60">
            Higgsfield AI Creative Studio - Powered by MuAPI
          </p>
        </div>
      </div>
    </div>
  );
}