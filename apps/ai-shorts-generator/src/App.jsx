import { showToast } from '../../lib/loading.js'
import { escapeHtml } from '../../lib/security.js'
import { supabase } from '../../lib/hybrid-supabase.js'
import { muapi } from '../../lib/muapi.js'

export default function AIShortsGenerator() {
  const container = document.createElement('div')
  container.className = 'w-full h-full flex flex-col overflow-hidden bg-app-bg text-white'

  let shorts = []
  let isProcessing = false

  // Header
  const header = document.createElement('div')
  header.className = 'flex items-center justify-between p-4 border-b border-white/5 bg-black/50'

  const titleGroup = document.createElement('div')
  titleGroup.className = 'flex items-center gap-3'

  const icon = document.createElement('div')
  icon.className = 'w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center'
  icon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>'

  const titleText = document.createElement('div')
  titleText.innerHTML = `
    <h1 class="text-xl font-black text-white">AI YOUTUBE SHORTS</h1>
    <p class="text-xs text-secondary">Turn long videos into viral vertical shorts</p>
  `

  titleGroup.appendChild(icon)
  titleGroup.appendChild(titleText)
  header.appendChild(titleGroup)

  const actionBtn = document.createElement('button')
  actionBtn.className = 'px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary text-xs font-bold rounded-lg transition-colors'
  actionBtn.textContent = '+ NEW SHORTS'
  actionBtn.onclick = () => showNewShortsModal()
  header.appendChild(actionBtn)
  container.appendChild(header)

  // Main content
  const main = document.createElement('div')
  main.className = 'flex-1 flex overflow-hidden'

  // Left panel - Shorts list
  const leftPanel = document.createElement('div')
  leftPanel.className = 'w-80 border-r border-white/5 overflow-y-auto bg-black/30'
  leftPanel.innerHTML = `
    <div class="p-4">
      <h3 class="font-bold text-white text-sm uppercase tracking-wider mb-3">MY SHORTS</h3>
      <div id="shorts-list" class="space-y-2">
        <div class="text-xs text-secondary italic p-2">No shorts yet. Create one!</div>
      </div>
    </div>
  `
  main.appendChild(leftPanel)

  // Right panel - Process form
  const rightPanel = document.createElement('div')
  rightPanel.className = 'flex-1 flex flex-col p-6 overflow-y-auto'
  rightPanel.innerHTML = `
    <div class="max-w-md">
      <h2 class="text-lg font-bold text-white mb-4">CREATE YOUTUBE SHORTS</h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-white mb-2">YOUTUBE VIDEO URL</label>
          <input type="url" id="video-url" placeholder="https://youtube.com/watch?v=..." class="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
        </div>
        
        <div>
          <label class="block text-xs font-bold text-white mb-2">MAX DURATION (seconds)</label>
          <select id="max-duration" class="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm">
            <option value="60">60 seconds</option>
            <option value="90">90 seconds</option>
            <option value="120">2 minutes</option>
          </select>
        </div>
        
        <button id="generate-btn" class="w-full px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/80 transition-colors">
          GENERATE SHORTS
        </button>
        
        <hr class="border-white/10 my-4">
        
        <div>
          <label class="block text-xs font-bold text-white mb-2">CUSTOM PROMPT (optional)</label>
          <textarea id="custom-prompt" placeholder="Add specific instructions for LLM..." class="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm h-20 resize-none"></textarea>
        </div>
      </div>
    </div>
  `

  const generateBtn = rightPanel.querySelector('#generate-btn')
  if (generateBtn) {
    generateBtn.onclick = () => processVideo()
  }

  main.appendChild(rightPanel)
  container.appendChild(main)

  // Functions
  async function processVideo() {
    const urlInput = rightPanel.querySelector('#video-url')
    const durationInput = rightPanel.querySelector('#max-duration')
    const promptInput = rightPanel.querySelector('#custom-prompt')

    const url = urlInput?.value?.trim()
    const duration = parseInt(durationInput?.value || '60')
    const customPrompt = promptInput?.value?.trim()

    if (!url) {
      showToast('Please enter a YouTube URL', 'error')
      return
    }

    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      showToast('Please enter a valid YouTube URL', 'error')
      return
    }

    isProcessing = true
    if (generateBtn) generateBtn.disabled = true
    if (generateBtn) generateBtn.textContent = 'PROCESSING...'

    try {
      showToast('Downloading and processing video...', 'info')

      // Create initial record
      const { data: record, error } = await supabase
        .from('shorts_videos')
        .insert([{
          source_url: url,
          max_duration: duration,
          status: 'processing',
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error

      // Call MuAPI for video processing
      const result = await muapi.generateVideo({
        prompt: customPrompt || `Create vertical YouTube shorts from video at ${url}. Extract key moments, auto-crop to 9:16, add captions.`,
        source_video: url,
        duration: duration,
        vertical: true
      })

      // Update record
      await supabase
        .from('shorts_videos')
        .update({ status: 'ready', processed_url: result?.url })
        .eq('id', record.id)

      shorts.unshift({ ...record, status: 'ready', processed_url: result?.url })
      renderShortsList()

      showToast('Shorts generated successfully!', 'success')

      if (urlInput) urlInput.value = ''
      if (promptInput) promptInput.value = ''
    } catch (error) {
      console.error('[AIShorts] Processing failed:', error)
      showToast(`Processing failed: ${error.message}`, 'error')
    } finally {
      isProcessing = false
      if (generateBtn) generateBtn.disabled = false
      if (generateBtn) generateBtn.textContent = 'GENERATE SHORTS'
    }
  }

  async function loadShorts() {
    try {
      const { data, error } = await supabase
        .from('shorts_videos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      shorts = data || []
      renderShortsList()
    } catch (error) {
      console.error('[AIShorts] Failed to load shorts:', error)
      renderShortsList([])
    }
  }

  function renderShortsList(s = shorts) {
    const listEl = leftPanel.querySelector('#shorts-list')
    if (!listEl) return

    if (s.length === 0) {
      listEl.innerHTML = '<div class="text-xs text-secondary italic p-2">No shorts yet. Create one!</div>'
      return
    }

    listEl.innerHTML = s.map(short => `
      <div class="p-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors" data-id="${short.id}">
        <div class="font-bold text-xs mb-1">${escapeHtml(short.source_url?.slice(0, 40) || 'Untitled')}</div>
        <div class="text-xs text-secondary">${short.status} • ${short.max_duration}s</div>
      </div>
    `).join('')
  }

  function showNewShortsModal() {
    const url = prompt('Enter YouTube URL:')
    if (url) {
      const urlInput = rightPanel.querySelector('#video-url')
      if (urlInput) urlInput.value = url
      processVideo()
    }
  }

  // Initialize
  loadShorts()

  return container
}