import { showToast } from '../../lib/loading.js'
import { escapeHtml } from '../../lib/security.js'
import { supabase } from '../../lib/hybrid-supabase.js'
import { muapi } from '../../lib/muapi.js'

export default function VidecoAIPlatform() {
  const container = document.createElement('div')
  container.className = 'w-full h-full flex flex-col overflow-hidden bg-app-bg text-white'

  let videos = []
  let isGenerating = false

  // Header
  const header = document.createElement('div')
  header.className = 'flex items-center justify-between p-4 border-b border-white/5 bg-black/50'

  const titleGroup = document.createElement('div')
  titleGroup.className = 'flex items-center gap-3'

  const icon = document.createElement('div')
  icon.className = 'w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center'
  icon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>'

  const titleText = document.createElement('div')
  titleText.innerHTML = `
    <h1 class="text-xl font-black text-white">VIDECO AI PLATFORM</h1>
    <p class="text-xs text-secondary">Professional AI Video Generation Suite</p>
  `

  titleGroup.appendChild(icon)
  titleGroup.appendChild(titleText)
  header.appendChild(titleGroup)

  const actionBtn = document.createElement('button')
  actionBtn.className = 'px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary text-xs font-bold rounded-lg transition-colors'
  actionBtn.textContent = '+ NEW PROJECT'
  actionBtn.onclick = () => showNewProjectModal()
  header.appendChild(actionBtn)
  container.appendChild(header)

  // Main content - Video Grid
  const main = document.createElement('div')
  main.className = 'flex-1 flex overflow-hidden'

  const videoGrid = document.createElement('div')
  videoGrid.className = 'flex-1 p-6 overflow-y-auto'
  videoGrid.innerHTML = `
    <div class="mb-4">
      <h2 class="text-lg font-bold text-white mb-2">PROJECTS</h2>
      <div id="video-grid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div class="text-xs text-secondary italic">Loading projects...</div>
      </div>
    </div>
    <div>
      <h2 class="text-lg font-bold text-white mb-2">TEMPLATES</h2>
      <div id="template-grid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div class="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors" data-template="youtube">
          <div class="text-3xl mb-2">📺</div>
          <div class="font-bold text-sm">YouTube Shorts</div>
        </div>
        <div class="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors" data-template="tiktok">
          <div class="text-3xl mb-2">🎵</div>
          <div class="font-bold text-sm">TikTok Video</div>
        </div>
        <div class="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors" data-template="commercial">
          <div class="text-3xl mb-2">📢</div>
          <div class="font-bold text-sm">Commercial</div>
        </div>
        <div class="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors" data-template="movie">
          <div class="text-3xl mb-2">🎬</div>
          <div class="font-bold text-sm">Movie Scene</div>
        </div>
      </div>
    </div>
  `
  main.appendChild(videoGrid)

  // Sidebar
  const sidebar = document.createElement('div')
  sidebar.className = 'w-64 border-l border-white/5 bg-black/30 p-4'
  sidebar.innerHTML = `
    <div class="space-y-4">
      <button class="w-full px-3 py-2 bg-primary/20 text-primary text-xs font-bold rounded-lg" data-action="text-to-video">TEXT TO VIDEO</button>
      <button class="w-full px-3 py-2 bg-white/5 text-secondary text-xs font-bold rounded-lg" data-action="image-to-video">IMAGE TO VIDEO</button>
      <button class="w-full px-3 py-2 bg-white/5 text-secondary text-xs font-bold rounded-lg" data-action="video-editing">VIDEO EDITING</button>
      <button class="w-full px-3 py-2 bg-white/5 text-secondary text-xs font-bold rounded-lg" data-action="lip-sync">LIP SYNC</button>
      <hr class="border-white/10">
      <button class="w-full px-3 py-2 bg-white/5 text-secondary text-xs font-bold rounded-lg" data-action="analytics">ANALYTICS</button>
      <button class="w-full px-3 py-2 bg-white/5 text-secondary text-xs font-bold rounded-lg" data-action="templates">TEMPLATES HUB</button>
    </div>
  `

  // Setup sidebar actions
  sidebar.querySelectorAll('[data-action]').forEach(btn => {
    btn.classList.remove('bg-white/5', 'text-secondary')
    btn.classList.add('hover:bg-white/10')
    btn.onclick = () => showToast(`${btn.textContent} - opening...`, 'info')
  })

  main.appendChild(sidebar)
  container.appendChild(main)

  // Functions
  async function loadVideos() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      videos = data || []
      renderVideoGrid(data || [])
    } catch (error) {
      console.error('[VidecoAI] Failed to load videos:', error)
      showToast('Failed to load projects', 'error')
    }
  }

  function renderVideoGrid(videos) {
    const grid = videoGrid.querySelector('#video-grid')
    if (!grid) return

    if (videos.length === 0) {
      grid.innerHTML = '<div class="text-xs text-secondary italic">No projects yet. Create one!</div>'
      return
    }

    grid.innerHTML = videos.map(v => `
      <div class="p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors" data-id="${v.id}">
        <div class="font-bold text-xs mb-1">${escapeHtml(v.title || 'Untitled')}</div>
        <div class="text-xs text-secondary">${v.status || 'Ready'}</div>
      </div>
    `).join('')
  }

  function showNewProjectModal() {
    const prompt = prompt('Enter project name:')
    if (!prompt) return
    showToast('Creating new project...', 'info')
  }

  // Load videos on init
  loadVideos()

  return container
}