import { PomelliRuntimeAdapter } from './adapter.js';

export function mountNative(container, options = {}) {
  const adapter = new PomelliRuntimeAdapter(options);

  const appUI = document.createElement('div');
  appUI.className = 'w-full h-full flex flex-col bg-app-bg';
  appUI.innerHTML = `
    <div class="p-4 border-b border-white/10">
      <h1 class="text-lg font-bold text-white">Open Pomelli</h1>
      <p class="text-sm text-secondary">AI-powered brand design, campaigns, photo studio, and video generation</p>
    </div>

    <div id="pom-brand-section" class="p-4 border-b border-white/5">
      <h2 class="text-xs font-bold text-secondary uppercase mb-2">Brand DNA</h2>
      <div class="flex flex-wrap gap-1.5">
        <button id="btn-analyze-brand" class="px-3 py-1 rounded bg-primary text-white text-xs font-medium hover:opacity-90">Analyze Brand</button>
        <button id="btn-get-presets"    class="px-3 py-1 rounded bg-surface text-secondary text-xs font-medium hover:bg-white/10">Photo Presets</button>
      </div>
    </div>

    <div id="pom-campaign-section" class="p-4 border-b border-white/5">
      <h2 class="text-xs font-bold text-secondary uppercase mb-2">Campaign</h2>
      <div class="flex flex-wrap gap-1.5">
        <button id="btn-get-goals"          class="px-3 py-1 rounded bg-surface text-secondary text-xs font-medium hover:bg-white/10">Goals</button>
        <button id="btn-generate-campaign"  class="px-3 py-1 rounded bg-primary text-white text-xs font-medium hover:opacity-90">Generate Campaign</button>
        <button id="btn-get-platform-spec"  class="px-3 py-1 rounded bg-surface text-secondary text-xs font-medium hover:bg-white/10">Platform Spec</button>
        <button id="btn-list-campaigns"    class="px-3 py-1 rounded bg-surface text-secondary text-xs font-medium hover:bg-white/10">List Campaigns</button>
      </div>
    </div>

    <div id="pom-photo-section" class="p-4 border-b border-white/5">
      <h2 class="text-xs font-bold text-secondary uppercase mb-2">Photo Studio</h2>
      <div class="flex flex-wrap gap-1.5">
        <button id="btn-photoshoot"   class="px-3 py-1 rounded bg-accent text-white text-xs font-medium hover:opacity-90">Photoshoot</button>
        <button id="btn-edit-image"   class="px-3 py-1 rounded bg-surface text-secondary text-xs font-medium hover:bg-white/10">Edit Image</button>
        <button id="btn-upscale"      class="px-3 py-1 rounded bg-surface text-secondary text-xs font-medium hover:bg-white/10">Upscale</button>
      </div>
    </div>

    <div id="pom-video-section" class="p-4 border-b border-white/5">
      <h2 class="text-xs font-bold text-secondary uppercase mb-2">Video & Animation</h2>
      <div class="flex flex-wrap gap-1.5">
        <button id="btn-animate-asset"  class="px-3 py-1 rounded bg-accent text-white text-xs font-medium hover:opacity-90">Animate Asset</button>
        <button id="btn-image-to-video" class="px-3 py-1 rounded bg-surface text-secondary text-xs font-medium hover:bg-white/10">I2V</button>
        <button id="btn-text-to-video"  class="px-3 py-1 rounded bg-surface text-secondary text-xs font-medium hover:bg-white/10">T2V</button>
      </div>
    </div>

    <div id="pom-project-section" class="p-4 border-b border-white/5">
      <h2 class="text-xs font-bold text-secondary uppercase mb-2">Project</h2>
      <div class="flex flex-wrap gap-1.5">
        <button id="btn-save-project"  class="px-3 py-1 rounded bg-surface text-secondary text-xs font-medium hover:bg-white/10">Save</button>
        <button id="btn-update-project" class="px-3 py-1 rounded bg-surface text-secondary text-xs font-medium hover:bg-white/10">Update</button>
        <button id="btn-delete-project" class="px-3 py-1 rounded bg-red-500/60 text-white text-xs font-medium hover:bg-red-500/80">Delete</button>
        <button id="btn-list-projects" class="px-3 py-1 rounded bg-surface text-secondary text-xs font-medium hover:bg-white/10">List</button>
      </div>
    </div>

    <div id="runtime-status" class="p-4 mt-auto border-t border-white/10">
      <p class="text-xs text-secondary">Analyze a website or pick a photo style to begin</p>
    </div>
  `;

  container.appendChild(appUI);

  const statusEl = appUI.querySelector('#runtime-status');
  statusEl.innerHTML = '<p class="text-xs text-secondary">Ready: ' + adapter.stack.llm + ' / ' + adapter.stack.generation + '</p>';

  return adapter;
}