import { showToast } from '../lib/loading.js'

export function AIInfluencerGenerator() {
  const container = document.createElement('div')
  container.className = 'w-full h-full flex flex-col overflow-hidden bg-app-bg text-white'

  // Embed iframe to standalone build
  const iframe = document.createElement('iframe')
  iframe.src = '/apps/ai-influencer-generator/'
  iframe.className = 'w-full h-full border-0'
  iframe.style.background = '#0f0f0f'
  container.appendChild(iframe)

  return container
}