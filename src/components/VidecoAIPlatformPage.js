export function VidecoAIPlatformPage() {
  const container = document.createElement('div');
  container.className = 'w-full h-full flex flex-col items-center justify-center bg-app-bg overflow-hidden';

  container.innerHTML = `
    <div class="text-center max-w-md mx-auto p-6">
      <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-white mb-3">Videco AI Platform</h1>
      <p class="text-secondary mb-6">Advanced AI-powered video creation and editing platform.</p>
      <div class="flex flex-col gap-3">
        <button class="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors">
          Coming Soon
        </button>
        <p class="text-xs text-muted">This feature is under development</p>
      </div>
    </div>
  `;

  return container;
}