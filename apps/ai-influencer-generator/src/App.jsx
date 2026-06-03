import { showToast } from '../../lib/loading.js'
import { escapeHtml } from '../../lib/security.js'
import { supabase } from '../../lib/hybrid-supabase.js'
import { muapi } from '../../lib/muapi.js'

export default function AIInfluencerGenerator() {
  const container = document.createElement('div')
  container.className = 'w-full h-full flex flex-col overflow-hidden bg-app-bg text-white'

  let generatedInfluencers = []
  let isGenerating = false

  // Header
  const header = document.createElement('div')
  header.className = 'flex items-center justify-between p-4 border-b border-white/5 bg-black/50'

  const titleGroup = document.createElement('div')
  titleGroup.className = 'flex items-center gap-3'

  const icon = document.createElement('div')
  icon.className = 'w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center'
  icon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M12 11v2"/><path d="M8 14c1 1 4 1 8 0"/></svg>'

  const titleText = document.createElement('div')
  titleText.innerHTML = `
    <h1 class="text-xl font-black text-white">AI INFLUENCER GENERATOR</h1>
    <p class="text-xs text-secondary">Create AI influencers with avatars & lip-sync videos</p>
  `

  titleGroup.appendChild(icon)
  titleGroup.appendChild(titleText)
  header.appendChild(titleGroup)

  const actionBtn = document.createElement('button')
  actionBtn.className = 'px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary text-xs font-bold rounded-lg transition-colors'
  actionBtn.textContent = '+ CREATE INFLUENCER'
  actionBtn.onclick = () => showCreateModal()
  header.appendChild(actionBtn)
  container.appendChild(header)

  // Main content
  const main = document.createElement('div')
  main.className = 'flex-1 flex overflow-hidden'

  // Left panel - Influencer list
  const leftPanel = document.createElement('div')
  leftPanel.className = 'w-80 border-r border-white/5 overflow-y-auto bg-black/30'
  leftPanel.innerHTML = `
    <div class="p-4">
      <h3 class="font-bold text-white text-sm uppercase tracking-wider mb-3">INFLUENCERS</h3>
      <div id="influencer-list" class="space-y-2">
        <div class="text-xs text-secondary italic p-2">No influencers yet. Create one!</div>
      </div>
    </div>
  `
  main.appendChild(leftPanel)

  // Right panel - Create form
  const rightPanel = document.createElement('div')
  rightPanel.className = 'flex-1 flex flex-col p-6 overflow-y-auto'
  rightPanel.innerHTML = `
    <div class="max-w-md">
      <h2 class="text-lg font-bold text-white mb-4">CREATE NEW INFLUENCER</h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-white mb-2">INFLUENCER NAME</label>
          <input type="text" id="influencer-name" placeholder="e.g., Alex, Sam, Jordan..." class="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
        </div>
        
        <div>
          <label class="block text-xs font-bold text-white mb-2">GENDER</label>
          <select id="influencer-gender" class="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
            <option value="any">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        
        <div>
          <label class="block text-xs font-bold text-white mb-2">DESCRIPTION</label>
          <textarea id="influencer-desc" placeholder="Describe their personality, style, niche..." class="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm h-24 resize-none"></textarea>
        </div>
        
        <button id="generate-btn" class="w-full px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/80 transition-colors">
          GENERATE AVATAR
        </button>
        
        <hr class="border-white/10 my-4">
        
        <div>
          <label class="block text-xs font-bold text-white mb-2">AUDIO MESSAGE (for lip-sync)</label>
          <textarea id="audio-message" placeholder="What should your influencer say?" class="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm h-20 resize-none"></textarea>
        </div>
        
        <button id="lipsync-btn" class="w-full px-4 py-2 bg-white/5 text-secondary font-bold rounded-lg hover:bg-white/10 transition-colors">
          + GENERATE LIP-SYNC VIDEO
        </button>
      </div>
    </div>
  `
  main.appendChild(rightPanel)
  container.appendChild(main)

  // Functions
  function bindEvents() {
    const generateBtn = rightPanel.querySelector('#generate-btn')
    const lipsyncBtn = rightPanel.querySelector('#lipsync-btn')

    if (generateBtn) {
      generateBtn.onclick = () => createInfluencer()
    }
    if (lipsyncBtn) {
      lipsyncBtn.onclick = () => createLipSync()
    }
  }

  async function createInfluencer() {
    const nameInput = rightPanel.querySelector('#influencer-name')
    const genderInput = rightPanel.querySelector('#influencer-gender')
    const descInput = rightPanel.querySelector('#influencer-desc')

    const name = nameInput?.value?.trim()
    const gender = genderInput?.value
    const desc = descInput?.value?.trim()

    if (!name) {
      showToast('Please enter an influencer name', 'error')
      return
    }

    isGenerating = true
    const generateBtn = rightPanel.querySelector('#generate-btn')
    if (generateBtn) generateBtn.disabled = true

    try {
      // Use MuAPI to generate avatar
      const prompt = `Portrait photo of a ${gender} influencer named ${name}. ${desc || 'Professional headshot, studio lighting, high quality, photorealistic'}`
      const result = await muapi.generateImage({
        prompt,
        width: 512,
        height: 512
      })

      const newInfluencer = {
        id: Date.now(),
        name,
        gender,
        description: desc,
        avatar: result?.url || null,
        created_at: new Date().toISOString()
      }

      generatedInfluencers.unshift(newInfluencer)
      renderInfluencerList()

      // Save to database
      await supabase.from('ai_influencers').insert([newInfluencer])
      showToast('Influencer created successfully!', 'success')

      // Reset form
      if (nameInput) nameInput.value = ''
      if (descInput) descInput.value = ''
    } catch (error) {
      console.error('[AIInfluencer] Failed to create influencer:', error)
      showToast(`Failed: ${error.message}`, 'error')
    } finally {
      isGenerating = false
      if (generateBtn) generateBtn.disabled = false
    }
  }

  async function createLipSync() {
    const messageInput = rightPanel.querySelector('#audio-message')
    const message = messageInput?.value?.trim()

    if (!message) {
      showToast('Please enter a message for lip-sync', 'error')
      return
    }

    try {
      showToast('Generating lip-sync video...', 'info')

      // Use MuAPI lip-sync endpoint
      const result = await muapi.generateVideo({
        prompt: message,
        lip_sync: true,
        audio: message
      })

      showToast('Lip-sync video generated!', 'success')
      if (messageInput) messageInput.value = ''
    } catch (error) {
      console.error('[AIInfluencer] Lip-sync failed:', error)
      showToast('Lip-sync generation coming soon', 'info')
    }
  }

  async function loadInfluencers() {
    try {
      const { data, error } = await supabase
        .from('ai_influencers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      generatedInfluencers = data || []
      renderInfluencerList()
    } catch (error) {
      console.error('[AIInfluencer] Failed to load influencers:', error)
      renderInfluencerList([])
    }
  }

  function renderInfluencerList(influencers = generatedInfluencers) {
    const listEl = leftPanel.querySelector('#influencer-list')
    if (!listEl) return

    if (influencers.length === 0) {
      listEl.innerHTML = '<div class="text-xs text-secondary italic p-2">No influencers yet. Create one!</div>'
      return
    }

    listEl.innerHTML = influencers.map(inf => `
      <div class="p-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors" data-id="${inf.id}">
        <div class="flex items-center gap-2">
          ${inf.avatar ? `<img src="${inf.avatar}" class="w-10 h-10 rounded-full object-cover" />` : '<div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">👤</div>'}
          <div>
            <div class="font-bold text-xs">${escapeHtml(inf.name)}</div>
            <div class="text-xs text-secondary">${inf.gender} • ${inf.description?.slice(0, 30) || ''}...</div>
          </div>
        </div>
      </div>
    `).join('')
  }

  function showCreateModal() {
    showToast('Fill the form to create an influencer', 'info')
  }

  // Initialize
  bindEvents()
  loadInfluencers()

  return container
}