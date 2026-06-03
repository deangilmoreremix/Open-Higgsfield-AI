// AI Influencer Generator - Standalone Vanilla JS

const container = document.getElementById('influencer-app')

if (container) {
  container.className = 'w-full h-full flex flex-col overflow-hidden bg-[#0f0f0f] text-white'

  // Header
  const header = document.createElement('div')
  header.className = 'flex items-center justify-between p-4 border-b border-white/5 bg-black/50'

  const titleGroup = document.createElement('div')
  titleGroup.className = 'flex items-center gap-3'

  const icon = document.createElement('div')
  icon.className = 'w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center'
  icon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M12 11v2"/><path d="M8 14c1 1 4 1 8 0"/></svg>'

  const titleText = document.createElement('div')
  titleText.innerHTML = `
    <h1 class="text-xl font-black text-white">AI INFLUENCER GENERATOR</h1>
    <p class="text-xs text-gray-400">Create AI influencers with avatars & lip-sync</p>
  `

  titleGroup.appendChild(icon)
  titleGroup.appendChild(titleText)
  header.appendChild(titleGroup)
  container.appendChild(header)

  // Main content
  const main = document.createElement('div')
  main.className = 'flex-1 flex overflow-hidden'

  // Left panel - Influencer list
  const leftPanel = document.createElement('div')
  leftPanel.className = 'w-80 border-r border-white/5 overflow-y-auto bg-black/30 p-4'
  leftPanel.innerHTML = `
    <h3 class="font-bold text-white text-sm uppercase tracking-wider mb-3">INFLUENCERS</h3>
    <div id="influencer-list" class="space-y-2">
      <div class="text-xs text-gray-400 italic">No influencers yet. Create one!</div>
    </div>
  `
  main.appendChild(leftPanel)

  // Right panel - Create form
  const rightPanel = document.createElement('div')
  rightPanel.className = 'flex-1 flex flex-col p-6 overflow-y-auto'
  rightPanel.innerHTML = `
    <div class="max-w-md">
      <h2 class="text-lg font-bold text-white mb-4">CREATE INFLUENCER</h2>
      
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-white mb-2">NAME</label>
          <input type="text" id="inf-name" placeholder="e.g., Alex..." class="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
        </div>
        
        <div>
          <label class="block text-xs font-bold text-white mb-2">DESCRIPTION</label>
          <textarea id="inf-desc" placeholder="Describe their style..." class="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm h-20 resize-none"></textarea>
        </div>
        
        <button id="generate-btn" class="w-full px-4 py-2 bg-purple-500/20 text-purple-400 font-bold rounded-lg hover:bg-purple-500/30 transition-colors">
          GENERATE AVATAR
        </button>
      </div>
    </div>
  `
  main.appendChild(rightPanel)
  container.appendChild(main)

  console.log('AI Influencer Generator initialized')
}