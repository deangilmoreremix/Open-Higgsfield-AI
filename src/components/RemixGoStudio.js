import { navigate } from '../lib/router.js';
import { muapi } from '../lib/muapi.js';
import { uploadFile } from '../lib/muapi.js';
import { savePendingJob, removePendingJob, getPendingJobs } from '../lib/pendingJobs.js';

export function RemixGoStudio() {
  const container = document.createElement('div');
  container.className = 'w-full h-full flex flex-col bg-app-bg overflow-hidden';

  // State
  let state = {
    projectName: 'Untitled Project',
    clips: [],
    timelineMode: 'edit'
  };

  // Header
  const header = document.createElement('div');
  header.className = 'flex items-center justify-between p-4 border-b border-white/10 bg-black/20';
  header.innerHTML = `
    <div class="flex items-center gap-3">
      <button id="back-btn" class="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="5" x2="5" y2="19"/><line x1="5" y1="19" x2="19" y2="5"/></svg>
      </button>
      <div>
        <p class="text-xs font-bold text-muted uppercase tracking-wider">Apps</p>
        <h1 class="text-lg font-bold text-white">Remix Go</h1>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <button id="export-btn" class="px-3 py-1.5 text-xs font-bold text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10">Export</button>
    </div>
  `;
  container.appendChild(header);

  // Main content
  const main = document.createElement('div');
  main.className = 'flex-1 flex flex-col p-6 overflow-hidden';

  // Controls row
  const controlsRow = document.createElement('div');
  controlsRow.className = 'mb-4 flex gap-3';
  controlsRow.innerHTML = `
    <input type="text" id="project-name-input" value="${state.projectName}" placeholder="Project name"
      class="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm max-w-xs">
    <button id="add-clip-btn"
      class="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg font-medium transition-colors">Add Clip</button>
    <button id="import-media-btn"
      class="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-colors">Import Media</button>
  `;
  main.appendChild(controlsRow);

  // Timeline area
  const timeline = document.createElement('div');
  timeline.className = 'flex-1 bg-black/30 rounded-xl border border-white/10 p-4 overflow-y-auto';
  timeline.id = 'timeline-area';
  main.appendChild(timeline);

  // Empty state
  if (state.clips.length === 0) {
    timeline.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full text-center">
        <div class="text-6xl mb-4 opacity-30">🎬</div>
        <p class="text-secondary text-lg mb-2">No clips yet</p>
        <p class="text-muted text-sm mb-4">Add clips or import media to get started</p>
        <button id="empty-add-clip-btn" class="px-6 py-3 bg-primary text-black rounded-lg font-bold hover:bg-primary/80 transition-colors">
          Create Your First Clip
        </button>
      </div>
    `;
  }

  container.appendChild(main);

  // Event handlers
  const updateProjectName = () => {
    const input = container.querySelector('#project-name-input');
    if (input) state.projectName = input.value;
  };

  const addClip = () => {
    const clip = {
      id: Date.now().toString(),
      name: `Clip ${state.clips.length + 1}`,
      duration: 5,
      startTime: state.clips.reduce((sum, c) => sum + (c.duration || 5), 0),
      effects: []
    };
    state.clips.push(clip);
    renderTimeline();
  };

  const renderTimeline = () => {
    const timelineEl = container.querySelector('#timeline-area');
    if (!timelineEl) return;

    if (state.clips.length === 0) {
      timelineEl.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-center">
          <div class="text-6xl mb-4 opacity-30">🎬</div>
          <p class="text-secondary text-lg mb-2">No clips yet</p>
          <p class="text-muted text-sm mb-4">Add clips or import media to get started</p>
          <button id="empty-add-clip-btn" class="px-6 py-3 bg-primary text-black rounded-lg font-bold hover:bg-primary/80 transition-colors">
            Create Your First Clip
          </button>
        </div>
      `;
      timelineEl.querySelector('#empty-add-clip-btn')?.addEventListener('click', addClip);
      return;
    }

    timelineEl.innerHTML = `
      <div class="space-y-3">
        ${state.clips.map((clip, idx) => `
          <div class="flex items-center gap-3 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-primary/50 transition-colors group" data-clip-id="${clip.id}">
            <div class="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-bold">
              ${idx + 1}
            </div>
            <div class="flex-1">
              <input type="text" value="${clip.name}" data-clip-name="${clip.id}"
                class="w-full bg-transparent border-b border-white/10 text-white font-medium focus:outline-none focus:border-primary/50 mb-1">
              <div class="flex items-center gap-4 text-xs text-secondary">
                <span>Duration: ${clip.duration}s</span>
                <span>Start: ${clip.startTime}s</span>
                <span>Effects: ${clip.effects.length}</span>
              </div>
            </div>
            <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button class="clip-delete px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors" data-clip-id="${clip.id}" title="Delete">✕</button>
            </div>
          </div>
        `).join('')}
      </div>
      ${state.clips.length > 0 ? `
        <div class="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
          <div class="text-sm text-secondary">
            Total Duration: <span class="text-white font-bold">${state.clips.reduce((sum, c) => sum + (c.duration || 5), 0)}s</span>
          </div>
          <button id="export-project-btn" class="px-4 py-2 bg-primary text-black rounded-lg font-bold hover:bg-primary/80 transition-colors">
            Export Project
          </button>
        </div>
      ` : ''}
    `;

    // Add event listeners for clips
    timelineEl.querySelectorAll('[data-clip-name]').forEach(input => {
      input.addEventListener('input', (e) => {
        const clipId = e.target.dataset.clipName;
        const clip = state.clips.find(c => c.id === clipId);
        if (clip) clip.name = e.target.value;
      });
    });

    timelineEl.querySelectorAll('.clip-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const clipId = e.target.dataset.clipId;
        state.clips = state.clips.filter(c => c.id !== clipId);
        renderTimeline();
      });
    });

    const exportBtn = timelineEl.querySelector('#export-project-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const projectData = {
          name: state.projectName,
          clips: state.clips,
          exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${state.projectName.replace(/\s+/g, '-').toLowerCase()}-remix.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  };

  // Wire up events
  container.querySelector('#back-btn')?.addEventListener('click', () => window.history.back());
  container.querySelector('#export-btn')?.addEventListener('click', () => {
    const projectData = {
      name: state.projectName,
      clips: state.clips,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.projectName.replace(/\s+/g, '-').toLowerCase()}-remix.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
  container.querySelector('#add-clip-btn')?.addEventListener('click', addClip);
  container.querySelector('#project-name-input')?.addEventListener('input', updateProjectName);

  // Import media handler
  container.querySelector('#import-media-btn')?.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*,image/*';
    input.multiple = true;
    input.onchange = async () => {
      const files = Array.from(input.files);
      for (const file of files) {
        try {
          const url = await uploadFile(null, file, () => {});
          const clip = {
            id: Date.now().toString() + Math.random(),
            name: file.name,
            duration: 5,
            startTime: state.clips.reduce((sum, c) => sum + (c.duration || 5), 0),
            sourceUrl: url
          };
          state.clips.push(clip);
        } catch (err) {
          console.error('Upload failed:', err);
        }
      }
      renderTimeline();
    };
    input.click();
  });

  // Initialize
  renderTimeline();

  return container;
}