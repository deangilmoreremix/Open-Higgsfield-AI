import { VidecoRuntimeAdapter } from './adapter.js';

export function mountNative(container, options = {}) {
  const adapter = new VidecoRuntimeAdapter(options);

  const appUI = document.createElement('div');
  appUI.className = 'w-full h-full flex flex-col bg-app-bg';
  appUI.innerHTML = `
    <div class="p-4 border-b border-white/10">
      <h1 class="text-lg font-bold text-white">Videco AI Platform</h1>
      <p class="text-sm text-secondary">Native Runtime Active</p>
    </div>
    <div id="runtime-status" class="p-4"></div>
  `;

  container.appendChild(appUI);

  const statusEl = appUI.querySelector('#runtime-status');
  statusEl.innerHTML = '<p class="text-xs text-secondary">Execution: idle</p>';

  return adapter;
}