// Open AI UGC - Standalone Vanilla JS

const container = document.getElementById('ugc-app')

if (container) {
  container.className = 'w-full h-full flex flex-col overflow-hidden bg-[#0f0f0f] text-white'

  // Header
  const header = document.createElement('div')
  header.className = 'flex items-center justify-between p-4 border-b border-white/5 bg-black/50'

  const titleGroup = document.createElement('div')
  titleGroup.className = 'flex items-center gap-3'

  const icon = document.createElement('div')
  icon.className = 'w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center'
  icon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'

  const titleText = document.createElement('div')
  titleText.innerHTML = `
    <h1 class="text-xl font-black text-white">OPEN AI UGC</h1>
    <p class="text-xs text-gray-400">User-generated content creation platform</p>
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
      <h2 class="text-lg font-bold text-white mb-4">UGC GENERATOR</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div class="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
          <div class="text-3xl mb-2">⭐</div>
          <div class="font-bold text-sm">Product Review</div>
        </div>
        <div class="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
          <div class="text-3xl mb-2">💬</div>
          <div class="font-bold text-sm">Testimonial</div>
        </div>
        <div class="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
          <div class="text-3xl mb-2">📦</div>
          <div class="font-bold text-sm">Unboxing</div>
        </div>
        <div class="p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
          <div class="text-3xl mb-2">🎓</div>
          <div class="font-bold text-sm">Tutorial</div>
        </div>
      </div>
    </div>
  `
  container.appendChild(main)

  console.log('Open AI UGC initialized')
}