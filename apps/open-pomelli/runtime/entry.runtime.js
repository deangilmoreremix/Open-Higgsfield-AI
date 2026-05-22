import { PomelliRuntimeAdapter } from './adapter.js';

export function mountNative(container, options = {}) {
  const adapter = new PomelliRuntimeAdapter(options);

  const appUI = document.createElement('div');
  appUI.className = 'w-full h-full flex flex-col bg-app-bg';
  appUI.innerHTML = `
    <div class="p-4 border-b border-white/10">
      <h1 class="text-lg font-bold text-white">Open Pomelli</h1>
      <p class="text-sm text-secondary">AI-powered brand design and campaign creation</p>
    </div>
    <div id="runtime-status" class="p-4">
      <p class="text-xs text-secondary">Analyze a website to extract brand DNA</p>
    </div>
  `;

  container.appendChild(appUI);

  const statusEl = appUI.querySelector('#runtime-status');
  statusEl.innerHTML = '<p class="text-xs text-secondary">Ready: ' + adapter.stack.llm + ' / ' + adapter.stack.generation + '</p>';

  return adapter;
}