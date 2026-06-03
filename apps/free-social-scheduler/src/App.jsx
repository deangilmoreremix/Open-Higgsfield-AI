import { showToast } from '../../lib/loading.js'
import { escapeHtml } from '../../lib/security.js'
import { supabase } from '../../lib/hybrid-supabase.js'

export default function FreeSocialScheduler() {
  const container = document.createElement('div')
  container.className = 'w-full h-full flex flex-col overflow-hidden bg-app-bg text-white'

  let scheduledPosts = []
  let isProcessing = false

  // Header
  const header = document.createElement('div')
  header.className = 'flex items-center justify-between p-4 border-b border-white/5 bg-black/50'

  const titleGroup = document.createElement('div')
  titleGroup.className = 'flex items-center gap-3'

  const icon = document.createElement('div')
  icon.className = 'w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center'
  icon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M8 22h8"/><path d="M5 12c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v5c0 1.1-.9 2-2 2H5z"/><path d="M2 18h20"/><path d="M2 14h20"/></svg>'

  const titleText = document.createElement('div')
  titleText.innerHTML = `
    <h1 class="text-xl font-black text-white">SOCIAL SCHEDULER</h1>
    <p class="text-xs text-secondary">Schedule and auto-post to social platforms</p>
  `

  titleGroup.appendChild(icon)
  titleGroup.appendChild(titleText)
  header.appendChild(titleGroup)

  const actionBtn = document.createElement('button')
  actionBtn.className = 'px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary text-xs font-bold rounded-lg transition-colors'
  actionBtn.textContent = '+ SCHEDULE POST'
  actionBtn.onclick = () => showNewPostModal()
  header.appendChild(actionBtn)
  container.appendChild(header)

  // Main content
  const main = document.createElement('div')
  main.className = 'flex-1 flex overflow-hidden'

  // Calendar view
  const calendar = document.createElement('div')
  calendar.className = 'flex-1 p-6 overflow-y-auto'

  const platforms = [
    { id: 'youtube', name: 'YouTube', icon: '📺', color: 'bg-red-500/20 text-red-400' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'bg-black/20 text-white' },
    { id: 'instagram', name: 'Instagram', icon: '📷', color: 'bg-pink-500/20 text-pink-400' },
    { id: 'twitter', name: 'Twitter', icon: '🐦', color: 'bg-blue-400/20 text-blue-400' },
    { id: 'facebook', name: 'Facebook', icon: '📘', color: 'bg-blue-600/20 text-blue-400' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-blue-700/20 text-blue-400' }
  ]

  calendar.innerHTML = `
    <div class="mb-6">
      <h2 class="text-lg font-bold text-white mb-4">SCHEDULED POSTS</h2>
      <div id="posts-list" class="space-y-3">
        <div class="text-xs text-secondary italic">No scheduled posts. Create one!</div>
      </div>
    </div>
    <div>
      <h2 class="text-lg font-bold text-white mb-4">PLATFORMS</h2>
      <div class="grid grid-cols-3 md:grid-cols-6 gap-3">
        ${platforms.map(p => `
          <div class="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors text-center" data-platform="${p.id}">
            <div class="text-2xl mb-1">${p.icon}</div>
            <div class="text-xs font-bold">${p.name}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `

  main.appendChild(calendar)

  // Sidebar
  const sidebar = document.createElement('div')
  sidebar.className = 'w-64 border-l border-white/5 bg-black/30 p-4'
  sidebar.innerHTML = `
    <div class="space-y-3">
      <button class="w-full px-3 py-2 bg-primary/20 text-primary text-xs font-bold rounded-lg" data-action="queue">POST QUEUE</button>
      <button class="w-full px-3 py-2 bg-white/5 text-secondary text-xs font-bold rounded-lg" data-action="analytics">ANALYTICS</button>
      <button class="w-full px-3 py-2 bg-white/5 text-secondary text-xs font-bold rounded-lg" data-action="templates">TEMPLATES</button>
      <hr class="border-white/10">
      <button class="w-full px-3 py-2 bg-white/5 text-secondary text-xs font-bold rounded-lg" data-action="settings">SETTINGS</button>
    </div>
  `

  sidebar.querySelectorAll('[data-action]').forEach(btn => {
    btn.onclick = () => showToast(`${btn.textContent} - coming soon`, 'info')
  })

  main.appendChild(sidebar)
  container.appendChild(main)

  // Functions
  async function loadScheduledPosts() {
    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .order('scheduled_at', { ascending: true })

      if (error) throw error
      scheduledPosts = data || []
      renderPostsList(data || [])
    } catch (error) {
      console.error('[SocialScheduler] Failed to load posts:', error)
      showToast('Failed to load scheduled posts', 'error')
      renderPostsList([])
    }
  }

  function renderPostsList(posts) {
    const list = calendar.querySelector('#posts-list')
    if (!list) return

    if (posts.length === 0) {
      list.innerHTML = '<div class="text-xs text-secondary italic">No scheduled posts. Create one!</div>'
      return
    }

    list.innerHTML = posts.map(p => `
      <div class="p-3 bg-white/5 rounded-lg" data-id="${p.id}">
        <div class="font-bold text-xs mb-1">${escapeHtml(p.title || 'Untitled')}</div>
        <div class="text-xs text-secondary">${p.platform} • ${p.scheduled_at ? new Date(p.scheduled_at).toLocaleString() : 'Not scheduled'}</div>
      </div>
    `).join('')
  }

  function showNewPostModal() {
    const prompt = prompt('Enter post content:')
    if (!prompt) return
    showToast('Scheduling post...', 'info')
  }

  // Load posts on init
  loadScheduledPosts()

  return container
}