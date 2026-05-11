import { showToast } from '../lib/loading.js';
import { escapeHtml } from '../lib/security.js';
import { supabase } from '../lib/hybrid-supabase.js';
import { muapi } from '../lib/muapi.js';

export function AIHeadshotGenerator() {
  const container = document.createElement('div');
  container.className = 'w-full h-full flex flex-col overflow-hidden bg-app-bg text-white';

  let selectedStyle = 'professional';
  let isGenerating = false;
  let userHeadshots = [];

  // Header
  const header = document.createElement('div');
  header.className = 'flex items-center justify-between p-4 border-b border-white/5 bg-black/50';
  
  const titleGroup = document.createElement('div');
  titleGroup.className = 'flex items-center gap-3';
  
  const icon = document.createElement('div');
  icon.className = 'w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center';
  icon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  
  const titleText = document.createElement('div');
  titleText.innerHTML = `
    <h1 class="text-xl font-black text-white">AI HEADSHOT</h1>
    <p class="text-xs text-secondary">Professional Portrait Generator</p>
  `;
  
  titleGroup.appendChild(icon);
  titleGroup.appendChild(titleText);
  header.appendChild(titleGroup);
  
  const creditDisplay = document.createElement('div');
  creditDisplay.className = 'px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full';
  creditDisplay.textContent = 'Credits: 10';
  header.appendChild(creditDisplay);
  container.appendChild(header);

  // Main content
  const main = document.createElement('div');
  main.className = 'flex-1 flex overflow-hidden';
  
  // Left panel - Generator
  const leftPanel = document.createElement('div');
  leftPanel.className = 'w-96 border-r border-white/5 overflow-y-auto bg-black/30 p-4';
  
  const promptSection = document.createElement('div');
  promptSection.className = 'mb-4';
  promptSection.innerHTML = `
    <h3 class="font-bold text-white text-sm uppercase tracking-wider mb-3">GENERATE HEADSHOT</h3>
    <div class="mb-3">
      <label class="block text-xs text-secondary mb-1">Prompt</label>
      <textarea class="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm h-20 resize-none" placeholder="Describe your desired headshot..."></textarea>
    </div>
    <div class="mb-3">
      <label class="block text-xs text-secondary mb-1">Style</label>
      <select class="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
        <option value="professional">Professional</option>
        <option value="casual">Casual</option>
        <option value="corporate">Corporate</option>
        <option value="creative">Creative</option>
      </select>
    </div>
    <div class="mb-3">
      <label class="block text-xs text-secondary mb-1">Resolution</label>
      <select class="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
        <option value="1K">1K</option>
        <option value="2K">2K</option>
        <option value="4K">4K</option>
      </select>
    </div>
    <button id="generate-btn" class="w-full px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50">
      GENERATE HEADSHOT
    </button>
  `;
  leftPanel.appendChild(promptSection);
  main.appendChild(leftPanel);
  
  // Right panel - Gallery
  const rightPanel = document.createElement('div');
  rightPanel.className = 'flex-1 overflow-y-auto p-4';
  rightPanel.innerHTML = `
    <h3 class="font-bold text-white text-sm uppercase tracking-wider mb-3">MY HEADSHOTS</h3>
    <div id="headshot-gallery" class="grid grid-cols-2 gap-3">
      <div class="text-xs text-secondary italic p-2">No headshots yet. Generate one!</div>
    </div>
  `;
  main.appendChild(rightPanel);
  
  container.appendChild(main);

  // Handler
  const generateBtn = leftPanel.querySelector('#generate-btn');
  generateBtn.onclick = async () => {
    if (isGenerating) return;
    
    isGenerating = true;
    generateBtn.disabled = true;
    showToast('Generating headshot...', 'info');
    
    try {
      // Use MuAPI for headshot generation
      const { data, error } = await supabase.functions.invoke('muapi-proxy', {
        body: {
          endpoint: 'gpt-5-nano',
          prompt: 'Generate a professional headshot...', // Would get from textarea
          model: 'nano-banana'
        }
      });
      
      if (error) throw error;
      
      showToast('Headshot generated successfully!', 'success');
      loadHeadshots();
    } catch (error) {
      console.error('[AIHeadshot] Generation failed:', error);
      showToast(`Failed: ${error.message}`, 'error');
    } finally {
      isGenerating = false;
      generateBtn.disabled = false;
    }
  };

  async function loadHeadshots() {
    try {
      const { data, error } = await supabase
        .from('headshots')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      userHeadshots = data || [];
      renderGallery();
    } catch (error) {
      console.error('[AIHeadshot] Failed to load headshots:', error);
    }
  }

  function renderGallery() {
    const galleryEl = rightPanel.querySelector('#headshot-gallery');
    if (!galleryEl) return;
    
    if (userHeadshots.length === 0) {
      galleryEl.innerHTML = '<div class="text-xs text-secondary italic p-2 col-span-2">No headshots yet. Generate one!</div>';
      return;
    }
    
    galleryEl.innerHTML = userHeadshots.map(h => `
      <div class="bg-white/5 rounded-lg overflow-hidden">
        <div class="aspect-square bg-black/50 flex items-center justify-center">
          <div class="text-xs text-secondary">Headshot preview</div>
        </div>
        <div class="p-2">
          <div class="text-xs font-bold text-white">${escapeHtml(h.style || 'Professional')}</div>
          <div class="text-xs text-secondary">${h.resolution || '1K'}</div>
        </div>
      </div>
    `).join('');
  }

  loadHeadshots();

  return container;
}
