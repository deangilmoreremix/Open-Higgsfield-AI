import { showToast } from '../lib/loading.js';
import { escapeHtml } from '../lib/security.js';
import { supabase } from '../lib/hybrid-supabase.js';
import { muapi } from '../lib/muapi.js';

export function OpenPomelliStudio() {
  const container = document.createElement('div');
  container.className = 'w-full h-full flex flex-col overflow-hidden bg-app-bg text-white';

  let currentBrandDNA = null;
  let isProcessing = false;
  const polls = { current: null };

  // Header
  const header = document.createElement('div');
  header.className = 'flex items-center justify-between p-4 border-b border-white/5 bg-black/50';
  
  const titleGroup = document.createElement('div');
  titleGroup.className = 'flex items-center gap-3';
  
  const icon = document.createElement('div');
  icon.className = 'w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center';
  icon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2v20M2 10h20"/></svg>';
  
  const titleText = document.createElement('div');
  titleText.innerHTML = `
    <h1 class="text-xl font-black text-white">OPEN POMELLI</h1>
    <p class="text-xs text-secondary">Brand DNA Extraction & Campaign Generator</p>
  `;
  
  titleGroup.appendChild(icon);
  titleGroup.appendChild(titleText);
  header.appendChild(titleGroup);
  
  const statusBadge = document.createElement('span');
  statusBadge.className = 'px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center gap-2';
  statusBadge.innerHTML = '<span class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span> READY';
  header.appendChild(statusBadge);
  
  container.appendChild(header);

  // Main content
  const main = document.createElement('div');
  main.className = 'flex-1 flex overflow-hidden';
  
  // Left panel - Input & Controls
  const leftPanel = document.createElement('div');
  leftPanel.className = 'w-96 border-r border-white/5 overflow-y-auto bg-black/30';
  
  const inputSection = document.createElement('div');
  inputSection.className = 'p-4 border-b border-white/5';
  
  const inputLabel = document.createElement('h3');
  inputLabel.className = 'font-bold text-white text-sm uppercase tracking-wider mb-3';
  inputLabel.textContent = 'BRAND URL';
  inputSection.appendChild(inputLabel);
  
  const urlInput = document.createElement('input');
  urlInput.type = 'url';
  urlInput.placeholder = 'https://example.com';
  urlInput.className = 'w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm mb-3';
  urlInput.setAttribute('data-test-id', 'url-input');
  inputSection.appendChild(urlInput);
  
  const analyzeBtn = document.createElement('button');
  analyzeBtn.className = 'w-full px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50';
  analyzeBtn.textContent = 'EXTRACT BRAND DNA';
  analyzeBtn.setAttribute('data-test-id', 'analyze-btn');
  analyzeBtn.onclick = () => handleExtractBrandDNA(urlInput.value);
  inputSection.appendChild(analyzeBtn);
  
  leftPanel.appendChild(inputSection);
  
  // Results section (initially hidden)
  const resultsSection = document.createElement('div');
  resultsSection.className = 'p-4';
  resultsSection.style.display = 'none';
  resultsSection.id = 'results-section';
  
  const resultsTitle = document.createElement('h3');
  resultsTitle.className = 'font-bold text-white text-sm uppercase tracking-wider mb-3';
  resultsTitle.textContent = 'BRAND DNA';
  resultsSection.appendChild(resultsTitle);
  
  const dnaDisplay = document.createElement('div');
  dnaDisplay.id = 'dna-display';
  dnaDisplay.className = 'space-y-3';
  resultsSection.appendChild(dnaDisplay);
  
  leftPanel.appendChild(resultsSection);
  main.appendChild(leftPanel);
  
  // Right panel - Preview
  const rightPanel = document.createElement('div');
  rightPanel.className = 'flex-1 flex flex-col';
  
  const previewHeader = document.createElement('div');
  previewHeader.className = 'p-4 border-b border-white/5 flex items-center justify-between';
  previewHeader.innerHTML = `
    <h3 class="font-bold text-white text-sm uppercase tracking-wider">CAMPAIGN PREVIEW</h3>
    <button id="generate-campaign-btn" class="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary text-xs font-bold rounded-lg transition-colors">
      GENERATE CAMPAIGN
    </button>
  `;
  rightPanel.appendChild(previewHeader);
  
  const previewArea = document.createElement('div');
  previewArea.className = 'flex-1 flex items-center justify-center bg-black/80';
  previewArea.innerHTML = `
    <div class="text-center">
      <div class="text-6xl mb-4">🎨</div>
      <p class="text-secondary text-sm">Enter a brand URL to extract DNA and generate campaigns</p>
    </div>
  `;
  rightPanel.appendChild(previewArea);
  
  main.appendChild(rightPanel);
  container.appendChild(main);

  // Error container
  const errorContainer = document.createElement('div');
  errorContainer.className = 'hidden';
  errorContainer.setAttribute('data-test-id', 'error-container');
  container.appendChild(errorContainer);

  // Handler functions
  async function handleExtractBrandDNA(url) {
    if (!url || isProcessing) return;
    
    if (!url.startsWith('http')) {
      showToast('Please enter a valid URL', 'error');
      return;
    }
    
    isProcessing = true;
    analyzeBtn.disabled = true;
    showToast('Extracting brand DNA...', 'info');
    
    try {
      // Use MuAPI for brand analysis
      const { data, error } = await supabase.functions.invoke('muapi-proxy', {
        body: {
          endpoint: 'gpt-5-nano',
          prompt: `Analyze the brand at ${url}. Extract: 1) Brand colors (HEX), 2) Typography style, 3) Brand voice/tone, 4) Key messaging themes. Return as JSON.`,
          model: 'gpt-5-nano'
        }
      });
      
      if (error) throw error;
      
      currentBrandDNA = data;
      displayBrandDNA(data);
      resultsSection.style.display = 'block';
      showToast('Brand DNA extracted successfully!', 'success');
      
    } catch (error) {
      console.error('[OpenPomelli] Brand DNA extraction failed:', error);
      showToast(`Extraction failed: ${error.message}`, 'error');
      
      errorContainer.className = 'absolute inset-0 flex items-center justify-center bg-red-500/10 z-10';
      errorContainer.innerHTML = `
        <div class="text-center max-w-md mx-auto p-6">
          <div class="text-red-500 mb-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold mb-2 text-white">Extraction Failed</h3>
          <p class="text-secondary mb-4">${escapeHtml(error.message)}</p>
          <button class="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors" onclick="location.reload()">
            Try Again
          </button>
        </div>
      `;
    } finally {
      isProcessing = false;
      analyzeBtn.disabled = false;
    }
  }

  function displayBrandDNA(dna) {
    dnaDisplay.innerHTML = `
      <div class="p-3 bg-white/5 rounded-lg">
        <h4 class="text-sm font-bold text-white mb-2">Brand Colors</h4>
        <div class="flex gap-2">
          ${dna.colors?.map(color => `
            <div class="w-8 h-8 rounded" style="background-color: ${color};" title="${color}"></div>
          `).join('') || '<span class="text-xs text-secondary">No colors detected</span>'}
        </div>
      </div>
      <div class="p-3 bg-white/5 rounded-lg">
        <h4 class="text-sm font-bold text-white mb-2">Brand Voice</h4>
        <p class="text-xs text-secondary">${escapeHtml(dna.voice || 'Not detected')}</p>
      </div>
      <div class="p-3 bg-white/5 rounded-lg">
        <h4 class="text-sm font-bold text-white mb-2">Key Messages</h4>
        <ul class="text-xs text-secondary space-y-1">
          ${dna.messages?.map(msg => `<li>• ${escapeHtml(msg)}</li>`).join('') || '<li>No messages detected</li>'}
        </ul>
      </div>
    `;
  }

  return container;
}
