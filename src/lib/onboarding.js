/**
 * Onboarding Modal - Phase 19 Implementation
 * Provides first-run experience for new users
 */

export function createOnboardingModal() {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center';
  modal.innerHTML = `
    <div class="bg-[#111318] border border-white/10 rounded-3xl p-8 max-w-2xl w-full mx-4 relative">
      <button class="absolute top-4 right-4 text-white/60 hover:text-white text-2xl" onclick="this.closest('.fixed').remove()" aria-label="Close onboarding">×</button>
      
      <div class="text-center mb-8">
        <div class="text-6xl mb-4">🎬</div>
        <h2 class="text-3xl font-black text-white mb-2">Welcome to Timeline Editor</h2>
        <p class="text-secondary">Your canvas awaits. Let's get you started.</p>
      </div>

      <div class="space-y-6 mb-8">
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-bold shrink-0">1</div>
          <div>
            <h3 class="text-white font-bold mb-1">Upload Your Media</h3>
            <p class="text-sm text-secondary">Click "Upload" in the right panel to add videos, images, or audio to your project.</p>
          </div>
        </div>
        
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-bold shrink-0">2</div>
          <div>
            <h3 class="text-white font-bold mb-1">Build Your Timeline</h3>
            <p class="text-sm text-secondary">Drag media from the library to the timeline. Use the +Track button to add more tracks.</p>
          </div>
        </div>
        
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary font-bold shrink-0">3</div>
          <div>
            <h3 class="text-white font-bold mb-1">Edit & Export</h3>
            <p class="text-sm text-secondary">Trim clips, add effects, then export your masterpiece. Press ? for keyboard shortcuts.</p>
          </div>
        </div>
      </div>

      <div class="flex gap-3 justify-center">
        <button class="px-6 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary-hover transition-colors" onclick="this.closest('.fixed').remove()">Let's Go!</button>
        <button class="px-6 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors" onclick="localStorage.setItem('onboarding_complete', 'true'); this.closest('.fixed').remove()">Don't Show Again</button>
      </div>
      
      <div class="mt-6 text-center">
        <p class="text-xs text-muted">Pro tip: Press Space to play/pause, Ctrl+Z to undo</p>
      </div>
    </div>
  `;
  return modal;
}

export function showOnboardingIfNeeded() {
  const completed = localStorage.getItem('onboarding_complete');
  if (completed) return;
  
  // Show after a brief delay so the UI can initialize
  setTimeout(() => {
    const modal = createOnboardingModal();
    document.body.appendChild(modal);
  }, 1000);
}
