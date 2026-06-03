// Free AI Social Media Scheduler - Standalone Vanilla JS

const container = document.getElementById('scheduler-app')

if (container) {
  container.className = 'w-full h-full flex flex-col overflow-hidden bg-[#0f0f0f] text-white'

  // Header
  const header = document.createElement('div')
  header.className = 'flex items-center justify-between p-4 border-b border-white/5 bg-black/50'

  const titleGroup = document.createElement('div')
  titleGroup.className = 'flex items-center gap-3'

  const icon = document.createElement('div')
  icon.className = 'w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center'
  icon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M8 22h8"/><path d="M5 12c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v5c0 1.1-.9 2-2 2H5z"/><path d="M2 18h20"/><path d="M2 14h20"/></svg>'

  const titleText = document.createElement('div')
  titleText.innerHTML = `
    <h1 class="text-xl font-black text-white">SOCIAL SCHEDULER</h1>
    <p class="text-xs text-gray-400">Schedule and auto-post to social platforms</p>
  `

  titleGroup.appendChild(icon)
  titleGroup.appendChild(titleText)
  header.appendChild(titleGroup)
  container.appendChild(header)

  // Main content
  const main = document.createElement('div')
  main.className = 'flex-1 p-6 overflow-y-auto'
  main.innerHTML = `
    <div class="mb-6">
      <h2 class="text-lg font-bold text-white mb-4">SCHEDULED POSTS</h2>
      <div id="posts-list" class="space-y-3 text-xs text-gray-400 italic">No scheduled posts. Create one!</div>
    </div>
    <div>
      <h2 class="text-lg font-bold text-white mb-4">PLATFORMS</h2>
      <div class="grid grid-cols-3 md:grid-cols-6 gap-3">
        <div class="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors text-center">
          <div class="text-2xl mb-1">📺</div>
          <div class="font-bold text-xs">YouTube</div>
        </div>
        <div class="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors text-center">
          <div class="text-2xl mb-1">🎵</div>
          <div class="font-bold text-xs">TikTok</div>
        </div>
        <div class="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors text-center">
          <div class="text-2xl mb-1">📷</div>
          <div class="font-bold text-xs">Instagram</div>
        </div>
        <div class="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors text-center">
          <div class="text-2xl mb-1">🐦</div>
          <div class="font-bold text-xs">Twitter</div>
        </div>
        <div class="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors text-center">
          <div class="text-2xl mb-1">📘</div>
          <div class="font-bold text-xs">Facebook</div>
        </div>
        <div class="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors text-center">
          <div class="text-2xl mb-1">💼</div>
          <div class="font-bold text-xs">LinkedIn</div>
        </div>
      </div>
    </div>
  `
  container.appendChild(main)

  console.log('Social Scheduler initialized')
}