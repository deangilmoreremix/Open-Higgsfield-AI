import { showToast } from '../lib/loading.js'

export function FreemSocialScheduler() {
  const container = document.createElement('div')
  container.className = 'w-full h-full flex flex-col overflow-hidden bg-app-bg text-white'

  const iframe = document.createElement('iframe')
  iframe.src = '/apps/free-social-scheduler/'
  iframe.className = 'w-full h-full border-0'
  iframe.style.background = '#0f0f0f'
  container.appendChild(iframe)

  return container
}