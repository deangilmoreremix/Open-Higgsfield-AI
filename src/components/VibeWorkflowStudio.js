import { showToast } from '../lib/loading.js';
import { escapeHtml } from '../lib/security.js';
import { supabase } from '../lib/hybrid-supabase.js';
import { muapi } from '../lib/muapi.js';

export function VibeWorkflowStudio() {
  const container = document.createElement('div');
  container.className = 'w-full h-full flex flex-col overflow-hidden bg-app-bg text-white';

  let workflows = [];
  let isProcessing = false;

  // Header
  const header = document.createElement('div');
  header.className = 'flex items-center justify-between p-4 border-b border-white/5 bg-black/50';
  
  const titleGroup = document.createElement('div');
  titleGroup.className = 'flex items-center gap-3';
  
  const icon = document.createElement('div');
  icon.className = 'w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center';
  icon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>';
  
  const titleText = document.createElement('div');
  titleText.innerHTML = `
    <h1 class="text-xl font-black text-white">VIBE WORKFLOW</h1>
    <p class="text-xs text-secondary">Node-Based AI Workflow Editor</p>
  `;
  
  titleGroup.appendChild(icon);
  titleGroup.appendChild(titleText);
  header.appendChild(titleGroup);
  
  const actions = document.createElement('div');
  actions.className = 'flex gap-3';
  
  const newWorkflowBtn = document.createElement('button');
  newWorkflowBtn.className = 'px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary text-xs font-bold rounded-lg transition-colors';
  newWorkflowBtn.textContent = '+ NEW WORKFLOW';
  newWorkflowBtn.onclick = () => createNewWorkflow();
  actions.appendChild(newWorkflowBtn);
  
  header.appendChild(actions);
  container.appendChild(header);

  // Main content
  const main = document.createElement('div');
  main.className = 'flex-1 flex overflow-hidden';
  
  // Left panel - Workflow list
  const leftPanel = document.createElement('div');
  leftPanel.className = 'w-80 border-r border-white/5 overflow-y-auto bg-black/30';
  leftPanel.innerHTML = `
    <div class="p-4">
      <h3 class="font-bold text-white text-sm uppercase tracking-wider mb-3">WORKFLOWS</h3>
      <div id="workflow-list" class="space-y-2">
        <div class="text-xs text-secondary italic p-2">No workflows yet. Create one!</div>
      </div>
    </div>
  `;
  main.appendChild(leftPanel);
  
  // Right panel - Workflow editor (placeholder)
  const rightPanel = document.createElement('div');
  rightPanel.className = 'flex-1 flex items-center justify-center bg-black/80';
  rightPanel.innerHTML = `
    <div class="text-center">
      <div class="text-6xl mb-4">🔄</div>
      <p class="text-secondary text-sm">Select or create a workflow to start editing</p>
    </div>
  `;
  main.appendChild(rightPanel);
  
  container.appendChild(main);

  // Functions
  async function createNewWorkflow() {
    const name = prompt('Enter workflow name:');
    if (!name) return;
    
    try {
      const { data, error } = await supabase
        .from('workflows')
        .insert([{ name, nodes: [], edges: [] }])
        .select()
        .single();
      
      if (error) throw error;
      
      workflows.push(data);
      renderWorkflowList();
      showToast('Workflow created!', 'success');
    } catch (error) {
      console.error('[VibeWorkflow] Failed to create workflow:', error);
      showToast(`Failed: ${error.message}`, 'error');
    }
  }

  function renderWorkflowList() {
    const listEl = leftPanel.querySelector('#workflow-list');
    if (!listEl) return;
    
    if (workflows.length === 0) {
      listEl.innerHTML = '<div class="text-xs text-secondary italic p-2">No workflows yet. Create one!</div>';
      return;
    }
    
    listEl.innerHTML = workflows.map(w => `
      <div class="p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors" data-id="${w.id}">
        <div class="font-bold text-white text-xs">${escapeHtml(w.name)}</div>
        <div class="text-xs text-secondary mt-1">${w.nodes?.length || 0} nodes</div>
      </div>
    `).join('');
  }

  // Load workflows
  async function loadWorkflows() {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*');
      
      if (error) throw error;
      workflows = data || [];
      renderWorkflowList();
    } catch (error) {
      console.error('[VibeWorkflow] Failed to load workflows:', error);
    }
  }

  // Initialize
  loadWorkflows();

  return container;
}
