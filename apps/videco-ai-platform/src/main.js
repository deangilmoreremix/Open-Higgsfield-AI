// Videco AI Platform - Standalone Vanilla JS
// Minimal implementation without external dependencies

const container = document.getElementById('videco-app')

if (container) {
  container.className = 'w-full h-full flex flex-col overflow-hidden bg-[#0f0f0f] text-white'

  // Header
  const header = document.createElement('div')
  header.className = 'flex items-center justify-between p-4 border-b border-white/5 bg-black/50'

  const titleGroup = document.createElement('div')
  titleGroup.className = 'flex items-center gap-3'

  const icon = document.createElement('div')
  icon.className = 'w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center'
  icon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>'

  const titleText = document.createElement('div')
  titleText.innerHTML = `
    <h1 class="text-xl font-black text-white">VIDECO AI PLATFORM</h1>
    <p class="text-xs text-gray-400">Professional AI Video Generation Suite</p>
  `

  titleGroup.appendChild(icon)
  titleGroup.appendChild(titleText)
  header.appendChild(titleGroup)
  container.appendChild(header)

  // Main content
  const main = document.createElement('div')
  main.className = 'flex-1 p-6 overflow-y-auto'
  main.innerHTML = `
    <div class="mb-4">
      <h2 class="text-lg font-bold text-white mb-2">PROJECTS</h2>
      <div id="video-grid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div class="text-xs text-gray-400 italic">No projects yet. Create one!</div>
      </div>
    </div>
    <div>
      <h2 class="text-lg font-bold text-white mb-2">TEMPLATES</h2>
      <div id="template-grid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div class="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
          <div class="text-3xl mb-2">📺</div>
          <div class="font-bold text-sm">YouTube Shorts</div>
        </div>
        <div class="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
          <div class="text-3xl mb-2">🎵</div>
          <div class="font-bold text-sm">TikTok Video</div>
        </div>
        <div class="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
          <div class="text-3xl mb-2">🎬</div>
          <div class="font-bold text-sm">Movie Scene</div>
        </div>
        <div class="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
          <div class="text-3xl mb-2">📢</div>
          <div class="font-bold text-sm">Commercial</div>
        </div>
      </div>
    </div>
  `
  container.appendChild(main)

  console.log('Videco AI Platform initialized')
}