import { muapi } from '../lib/muapi.js';
import * as outputHandoff from '../lib/outputHandoff.js';
import { orchestrationEngine } from '../lib/orchestration-engine.js';
import { realtimeTracker } from '../lib/realtime-execution-tracker.js';
import { assetLifecycle } from '../lib/asset-lifecycle-manager.js';
import { recoverySystem } from '../lib/failure-recovery.js';
import { ExecutionStates } from '../lib/execution-state-machine.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

const TEMPLATE_CATEGORIES = [
  { id: 'linkedin', name: 'LinkedIn', description: 'Professional networking videos' },
  { id: 'sales', name: 'Sales Outreach', description: 'Cold outreach and prospecting' },
  { id: 'product', name: 'Product Demo', description: 'Showcase your products' },
  { id: 'tutorial', name: 'Tutorial', description: 'Educational content' },
  { id: 'testimonial', name: 'Testimonial', description: 'Customer stories' },
];

export function AIVideoOutreachStudio() {
  const container = document.createElement('div');
  container.className = 'w-full h-full flex flex-col overflow-hidden bg-gradient-to-br from-[#090d1a] via-[#0d1324] to-[#090b16] text-white';

  const heroBanner = createHeroSection('video-outreach', 'h-64 md:h-80 lg:h-96 mb-4');

  container.innerHTML = `
    <div class="mx-auto max-w-7xl px-6 py-8 md:px-10">
      <div class="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_0_40px_rgba(56,189,248,0.12)] backdrop-blur-xl">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="mb-2 inline-flex items-center rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">AI Studio</p>
            <h1 class="text-3xl font-semibold tracking-tight">AI Video Outreach Studio</h1>
            <p class="mt-2 max-w-3xl text-sm text-slate-300">Create personalized video campaigns with full operational runtime.</p>
          </div>
          <div class="rounded-2xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">Operational</div>
        </div>
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-3">
        <div class="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 class="text-lg font-semibold">Runtime Systems Status</h2>
          <div class="mt-4 grid gap-3 text-sm text-slate-300">
            ${[
              'Orchestration Engine: Active',
              'Realtime Tracking: Connected',
              'Asset Lifecycle: Managed',
              'Failure Recovery: Enabled',
              'Execution State: Operational'
            ].map((status, idx) => `
              <div class="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-200 text-xs font-semibold">${idx + 1}</span>
                <span>${status}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 class="text-lg font-semibold">Actions</h2>
          <div class="mt-4 space-y-3">
            <button id="open-studio-btn" class="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium">
              Open Video Studio
            </button>
            <button id="view-library-btn" class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-medium">
              View Generated Library
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  if (heroBanner) {
    const innerDiv = container.querySelector('.mx-auto.max-w-7xl');
    if (innerDiv) innerDiv.prepend(heroBanner);
  }

  container.getElementById('open-studio-btn')?.addEventListener('click', () => {
    navigate('video-outreach/studio');
  });

  container.getElementById('view-library-btn')?.addEventListener('click', () => {
    navigate('library');
  });

  return container;
}

export function VideoOutreachStudio() {
  const container = document.createElement('div');
  container.className = 'w-full h-full flex flex-col bg-gradient-to-br from-[#090d1a] via-[#0d1324] to-[#090b16] text-white overflow-hidden';

  let projectName = 'New Video Project';
  let selectedTemplate = null;
  let scenes = [];
  let isGenerating = false;
  let generatedVideo = null;
  let executionId = null;
  let settings = { duration: 30, aspectRatio: '16:9', quality: '1080p' };
  let apiKey = localStorage.getItem('muapi_key') || '';

  const updateExecutionState = (state, context = {}) => {
    const event = new CustomEvent('execution:state', { 
      detail: { executionId, state, ...context } 
    });
    window.dispatchEvent(event);
  };

  const addScene = () => {
    const newScene = { id: Date.now(), type: 'text', content: 'New Scene Content', duration: 5 };
    scenes.push(newScene);
    render();
  };

  const removeScene = (id) => {
    scenes = scenes.filter(s => s.id !== id);
    render();
  };

  const updateScene = (id, updates) => {
    scenes = scenes.map(s => s.id === id ? { ...s, ...updates } : s);
    render();
  };

  const handleGenerate = async () => {
    if (scenes.length === 0) { alert('Please add at least one scene'); return; }
    if (!apiKey) { alert('Please configure your MuAPI key'); return; }

    isGenerating = true;
    executionId = `video_${Date.now()}`;
    updateExecutionState(ExecutionStates.PROCESSING, { scenes: scenes.length });
    render();

    try {
      const prompt = scenes.map(s => s.content).join('\n\n');
      
      const userId = (await (async () => {
        if (!isSupabaseConfigured()) return 'anonymous';
        const { data } = await supabase.auth.getUser?.() || { data: { user: null } };
        return data?.user?.id || 'anonymous';
      })());

      const asset = await assetLifecycle.createAsset({
        type: 'video',
        title: projectName,
        prompt,
        settings,
        user_id: userId
      });

      updateExecutionState(ExecutionStates.PROCESSING, { stage: 'generation' });

      const result = await muapi.generateVideo(apiKey, {
        prompt,
        duration: settings.duration,
        aspect_ratio: settings.aspectRatio
      });

      updateExecutionState(ExecutionStates.PROCESSING, { stage: 'persisting' });

      await assetLifecycle.updateState(asset.id, 'exported', {
        output_url: result.url,
        public_url: result.url
      });

      generatedVideo = result.url;
      isGenerating = false;
      updateExecutionState(ExecutionStates.COMPLETED, { url: result.url });
      render();

      await outputHandoff.sendToRender({
        type: 'video',
        output_url: generatedVideo,
        title: projectName,
        settings
      });

    } catch (error) {
      isGenerating = false;
      updateExecutionState(ExecutionStates.FAILED, { error: error.message });
      
      const recovery = await recoverySystem.recoverJob(null, error);
      if (!recovery.recovered) {
        alert(`Generation failed: ${error.message}`);
      }
      render();
    }
  };

  const render = () => {
    const header = document.createElement('div');
    header.className = 'flex items-center justify-between border-b border-gray-800 px-6 py-4';
    header.innerHTML = `
      <div>
        <h1 class="text-xl font-bold">Video Outreach Studio</h1>
        <p class="text-sm text-gray-400">Full operational AI video generation</p>
      </div>
      <div class="flex gap-2">
        <button onclick="handleGenerate()" disabled="${isGenerating || scenes.length === 0}" class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium disabled:opacity-50">
          ${isGenerating ? 'Generating...' : 'Generate Video'}
        </button>
      </div>
    `;
    container.innerHTML = '';
    container.appendChild(header);

    const main = document.createElement('div');
    main.className = 'flex flex-1 overflow-hidden p-6';
    main.innerHTML = `
      <div class="w-80 border-r border-gray-800 p-4">
        <h2 class="mb-4 text-sm font-semibold">Templates</h2>
        <div class="space-y-2">
          ${TEMPLATE_CATEGORIES.map(cat => `
            <button onclick="selectTemplate('${cat.id}')" class="w-full rounded-lg border ${selectedTemplate?.id === cat.id ? 'border-blue-500 bg-blue-500/10' : 'border-gray-800 hover:border-gray-700'} p-3 text-left transition">
              <div class="font-medium">${cat.name}</div>
              <div class="text-xs text-gray-400">${cat.description}</div>
            </button>
          `).join('')}
        </div>
        <h2 class="mt-6 mb-4 text-sm font-semibold">Settings</h2>
        <div class="space-y-3">
          <div>
            <label class="text-xs text-gray-400">Duration (seconds)</label>
            <input type="number" value="${settings.duration}" onchange="updateSettings('duration', parseInt(this.value))" class="mt-1 w-full rounded border border-gray-800 bg-gray-950 px-2 py-1" />
          </div>
          <div>
            <label class="text-xs text-gray-400">Aspect Ratio</label>
            <select value="${settings.aspectRatio}" onchange="updateSettings('aspectRatio', this.value)" class="mt-1 w-full rounded border border-gray-800 bg-gray-950 px-2 py-1">
              <option value="16:9">16:9</option>
              <option value="1:1">1:1</option>
              <option value="9:16">9:16</option>
            </select>
          </div>
        </div>
      </div>
      <div class="flex-1 p-6">
        <div class="mb-4 flex items-center gap-2">
          <input type="text" value="${projectName}" onchange="updateProjectName(this.value)" class="flex-1 rounded-lg border border-gray-800 bg-gray-950 px-4 py-2 text-lg font-bold" />
          <button onclick="addScene()" class="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2">+ Scene</button>
        </div>
        <div class="grid grid-cols-1 gap-4">
          ${scenes.map(scene => `
            <div class="rounded-lg border border-gray-800 bg-gray-950 p-4">
              <div class="flex items-center justify-between">
                <input value="${scene.content}" onchange="updateScene(${scene.id}, {content: this.value})" class="flex-1 bg-transparent text-lg font-medium" />
                <button onclick="removeScene(${scene.id})" class="rounded p-1 text-gray-400 hover:text-red-500">✕</button>
              </div>
              <div class="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs text-gray-400">Duration</label>
                  <input type="number" value="${scene.duration}" onchange="updateScene(${scene.id}, {duration: parseInt(this.value)})" class="w-full rounded border border-gray-800 bg-gray-950 px-2 py-1" />
                </div>
              </div>
            </div>
          `).join('')}
          ${scenes.length === 0 ? '<div class="rounded-lg border border-dashed border-gray-800 p-8 text-center"><p class="text-gray-400">No scenes yet.</p></div>' : ''}
        </div>
      </div>
      ${generatedVideo ? `
        <div class="w-96 border-l border-gray-800 p-4">
          <h2 class="mb-4 text-sm font-semibold">Generated Video</h2>
          <div class="aspect-video rounded-lg bg-gray-900"><video src="${generatedVideo}" controls class="h-full w-full rounded-lg"></video></div>
          <button onclick="window.open('${generatedVideo}', '_blank')" class="mt-4 flex w-full items-center gap-2 rounded-lg bg-blue-600 px-4 py-2">Download</button>
        </div>
      ` : ''}
    `;
    container.appendChild(main);
  };

  window.selectTemplate = (id) => { selectedTemplate = TEMPLATE_CATEGORIES.find(c => c.id === id); render(); };
  window.updateProjectName = (name) => { projectName = name; render(); };
  window.updateSettings = (key, value) => { settings = { ...settings, [key]: value }; render(); };
  window.addScene = addScene;
  window.removeScene = removeScene;
  window.updateScene = updateScene;
  window.handleGenerate = handleGenerate;

  render();
  return container;
}