// director/integrations-modal.js
// Vanilla credential setup modal for Slack/HubSpot/Salesforce
// Uses the existing director design system: bg-[#08090b], white/[0.04], rounded-2xl, lime-300, Lucide icons

window.openIntegrationModal = async function (integrationType) {
  const config = window.DIRECTOR_CONFIG;
  const titles = { slack: 'Slack', hubspot: 'HubSpot', salesforce: 'Salesforce' };
  const placeholders = {
    slack: 'https://hooks.slack.com/services/T.../B.../...',
    hubspot: 'Enter your HubSpot Private App access token',
    salesforce: 'Enter JSON: { "apiKey": "...", "instanceUrl": "https://yourcompany.my.salesforce.com" }',
  };

  const existing = document.getElementById('director-integration-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'director-integration-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm';
  modal.innerHTML = `
    <div class="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 w-[480px] max-w-[92vw] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
      <div class="flex items-center gap-3 mb-4">
        <div class="flex h-10 w-10 items-center justify-center rounded-2xl border border-lime-400/20 bg-lime-400/10">
          <i data-lucide="link" class="h-5 w-5 text-lime-300"></i>
        </div>
        <div>
          <div class="text-xl font-black tracking-tight">Connect ${titles[integrationType]}</div>
          <div class="text-xs text-white/45">Save your credentials to enable this agent</div>
        </div>
      </div>
      <textarea id="cred-input" rows="4" placeholder="${placeholders[integrationType]}"
        class="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white outline-none placeholder:text-white/35 font-mono focus:border-lime-400/40"></textarea>
      <div id="cred-error" class="hidden mt-2 text-xs text-red-300"></div>
      <div class="mt-4 flex justify-end gap-2">
        <button id="cred-cancel" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10">Cancel</button>
        <button id="cred-test" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10">Test</button>
        <button id="cred-save" class="rounded-2xl bg-lime-300 px-4 py-2 text-sm font-semibold text-black shadow-[0_0_24px_rgba(190,242,100,0.18)]">Save</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  if (window.lucide) window.lucide.createIcons();

  const getCreds = () => {
    const raw = document.getElementById('cred-input').value.trim();
    if (integrationType === 'slack') return { webhook: raw };
    if (integrationType === 'hubspot') return { apiKey: raw };
    try { return JSON.parse(raw); } catch { return null; }
  };

  const showError = (msg) => {
    const e = document.getElementById('cred-error');
    e.textContent = msg;
    e.classList.remove('hidden');
  };

  const getToken = async () => {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const client = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
    const { data } = await client.auth.getSession();
    return data?.session?.access_token || '';
  };

  document.getElementById('cred-cancel').onclick = () => modal.remove();
  document.getElementById('cred-test').onclick = async () => {
    const creds = getCreds();
    if (!creds) return showError('Invalid format');
    const token = await getToken();
    const res = await fetch(`${config.BACKEND_URL}/api/integrations/test/${integrationType}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ credentials: creds }),
    });
    if (res.ok) {
      const e = document.getElementById('cred-error');
      e.textContent = 'Connection successful!';
      e.className = 'mt-2 text-xs text-lime-300';
    } else {
      const err = await res.json().catch(() => ({}));
      showError(`Test failed: ${err.error?.message || res.status}`);
    }
  };
  document.getElementById('cred-save').onclick = async () => {
    const creds = getCreds();
    if (!creds) return showError('Invalid format');
    const token = await getToken();
    const res = await fetch(`${config.BACKEND_URL}/api/integrations`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: integrationType, credentials: creds }),
    });
    if (res.ok) {
      modal.remove();
      window.dispatchEvent(new CustomEvent('director-integration-saved', { detail: { type: integrationType } }));
    } else {
      const err = await res.json().catch(() => ({}));
      showError(`Save failed: ${err.error?.message || res.status}`);
    }
  };
};
