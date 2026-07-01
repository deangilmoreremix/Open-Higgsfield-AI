import { useState, useEffect } from 'react';
import { X, Link, Check } from 'lucide-react';

const TITLES = { slack: 'Slack', hubspot: 'HubSpot', salesforce: 'Salesforce' };
const PLACEHOLDERS = {
  slack: 'https://hooks.slack.com/services/T.../B.../...',
  hubspot: 'HubSpot Private App token',
  salesforce: '{"apiKey":"...","instanceUrl":"https://..."}',
};

export function IntegrationsModal({ type, onClose, supabase }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  const parseCreds = () => {
    if (type === 'slack') return { webhook: value.trim() };
    if (type === 'hubspot') return { apiKey: value.trim() };
    try { return JSON.parse(value); } catch { return null; }
  };

  const callApi = async (path, body) => {
    const backendUrl = import.meta.env.VITE_DIRECTOR_BACKEND_URL || 'https://director-backend.onrender.com';
    const { data } = await supabase.auth.getSession();
    const res = await fetch(`${backendUrl}${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${data?.session?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return res;
  };

  const test = async () => {
    setError(null);
    const creds = parseCreds();
    if (!creds) return setError('Invalid format');
    setBusy(true);
    try {
      const res = await callApi(`/api/integrations/test/${type}`, { credentials: creds });
      if (res.ok) setSuccess(true);
      else {
        const j = await res.json().catch(() => ({}));
        setError(j.error?.message || `Test failed: ${res.status}`);
      }
    } finally { setBusy(false); }
  };

  const save = async () => {
    setError(null);
    const creds = parseCreds();
    if (!creds) return setError('Invalid format');
    setBusy(true);
    try {
      const res = await callApi('/api/integrations', { type, credentials: creds });
      if (res.ok) onClose();
      else {
        const j = await res.json().catch(() => ({}));
        setError(j.error?.message || `Save failed: ${res.status}`);
      }
    } finally { setBusy(false); }
  };

  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 w-[480px] max-w-[92vw] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
              <Link className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-xl font-black">Connect {TITLES[type]}</div>
              <div className="text-xs text-secondary">Save your credentials to enable this agent</div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-secondary hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <textarea
          rows={4}
          placeholder={PLACEHOLDERS[type]}
          value={value}
          onChange={(e) => { setValue(e.target.value); setSuccess(false); }}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white outline-none placeholder:text-secondary/50 font-mono focus:border-primary/40"
        />
        {error && <div className="mt-2 text-xs text-red-300">{error}</div>}
        {success && <div className="mt-2 text-xs text-primary flex items-center gap-1"><Check className="h-3 w-3" /> Connection successful!</div>}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">Cancel</button>
          <button onClick={test} disabled={busy} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50">Test</button>
          <button onClick={save} disabled={busy} className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50">Save</button>
        </div>
      </div>
    </div>
  );
}

export function IntegrationsModalHost({ supabase }) {
  const [type, setType] = useState(null);
  useEffect(() => {
    const handler = (e) => setType(e.detail.type);
    window.addEventListener('open-integrations-modal', handler);
    return () => window.removeEventListener('open-integrations-modal', handler);
  }, []);
  return <IntegrationsModal type={type} onClose={() => setType(null)} supabase={supabase} />;
}
