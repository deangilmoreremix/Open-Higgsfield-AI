export function RealTimelinePage() {
  const container = document.createElement('div')
  container.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;'

  setTimeout(async () => {
    const { Timeline } = await import('./Timeline.js')
    const timeline = new Timeline()
    timeline.mount(container)
  }, 100)

  return container
}
