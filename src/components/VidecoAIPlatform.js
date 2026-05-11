import { showToast } from '../lib/loading.js';
import { escapeHtml } from '../lib/security.js';
import { supabase } from '../lib/hybrid-supabase.js';
import { muapi } from '../lib/muapi.js';

export function VidecoAIPlatform() {
  const container = document.createElement('div');
  container.className = 'w-full h-full flex flex-col overflow-hidden bg-app-bg text-white';

  let currentVideo = null;
  let isGenerating = false;

  // Header
  const header = document.createElement('div');
  header.className = 'flex items-center justify-between p-4 border-b border-white/5 bg-black/50';
  
  const titleGroup = document.createElement('div');
  titleGroup.className = 'flex items-center gap-3';
  
  const icon = document.createElement('div');
  icon.className = 'w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center';
  icon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>';
  
  const titleText = document.createElement('div');
  titleText.innerHTML = `
    <h1 class="text-xl font-black text-white">VIDECO AI</h1>
    <p class="text-xs text-secondary">AI Video Generation Platform</p>
  `;
  
  titleGroup.appendChild(icon);
  titleGroup.appendChild(titleText);
  header.appendChild(titleGroup);
  
  const actionBtn = document.createElement('button');
  actionBtn.className = 'px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary text-xs font-bold rounded-lg transition-colors';
  actionBtn.textContent = 'NEW VIDEO';
  actionBtn.onclick = () => showNewVideoModal();
  header.appendChild(actionBtn);
  container.appendChild(header);

  // Main content
  const main = document.createElement('div');
  main.className = 'flex-1 flex overflow-hidden';
  
  // Left panel - Video list
  const leftPanel = document.createElement('div');
  leftPanel.className = 'w-80 border-r border-white/5 overflow-y-auto bg-black/30';
  leftPanel.innerHTML = `
    <div class="p-4">
      <h3 class="font-bold text-white text-sm uppercase tracking-wider mb-3">MY VIDEOS</h3>
      <div id="video-list" class="space-y-2">
        <div class="text-xs text-secondary italic p-2">No videos yet. Create one!</div>
      </div>
    </div>
  `;
  main.appendChild(leftPanel);
  
  // Right panel - Preview/Editor
  const rightPanel = document.createElement('div');
  rightPanel.className = 'flex-1 flex flex-col';
  
  const previewArea = document.createElement('div');
  previewArea.className = 'flex-1 flex items-center justify-center bg-black/80';
  previewArea.innerHTML = `
    <div class="text-center">
      <div class="text-6xl mb-4">🎬</div>
      <p class="text-secondary text-sm">Select or create a video to start editing</p>
    </div>
  `;
  rightPanel.appendChild(previewArea);
  
  main.appendChild(rightPanel);
  container.appendChild(main);

  // Modal placeholder
  function showNewVideoModal() {
    showToast('Video generation modal - coming soon!', 'info');
  }

  // Load user's videos
  async function loadVideos() {
    try {
      const { data, error } = await supabase
        .from('vides')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      renderVideoList(data || []);
    } catch (error) {
      console.error('[VidecoAI] Failed to load videos:', error);
    }
  }

  function renderVideoList(videos) {
    const listEl = leftPanel.querySelector('#video-list');
    if (!listEl) return;
    
    if (videos.length === 0) {
      listEl.innerHTML = '<div class="text-xs text-secondary italic p-2">No videos yet. Create one!</div>';
      return;
    }
    
    listEl.innerHTML = videos.map(v => `
      <div class="p-2 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" data-id="${v.id}">
        <div class="font-bold text-white text-xs">${escapeHtml(v.title || 'Untitled')}</div>
        <div class="text-xs text-secondary mt-1">${v.status || 'Processing'}</div>
      </div>
    `).join('');
  }

  loadVideos();

  return container;
}
