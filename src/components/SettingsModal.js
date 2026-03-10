export function SettingsModal(onClose) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-6';

    const removeModal = () => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (onClose) onClose();
    };

    const modal = document.createElement('div');
    modal.className = 'w-full max-w-sm bg-panel-bg border border-white/10 rounded-3xl p-8 shadow-3xl animate-fade-in-up';

    const title = document.createElement('h2');
    title.textContent = 'Settings';
    title.className = 'text-xl font-black text-white mb-6';

    const label = document.createElement('label');
    label.textContent = 'Muapi API Key';
    label.className = 'block text-[10px] font-bold text-muted uppercase tracking-widest mb-2 ml-1';

    const input = document.createElement('input');
    input.type = 'password';
    input.className = 'w-full mb-6 bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors shadow-inner';
    input.value = localStorage.getItem('muapi_key') || '';
    input.placeholder = 'sk-...';

    const btnContainer = document.createElement('div');
    btnContainer.className = 'flex justify-end gap-3';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'px-5 py-2.5 rounded-xl text-sm font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all';
    cancelBtn.onclick = removeModal;

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.className = 'px-6 py-2.5 rounded-xl bg-primary text-black font-black text-sm hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all';

    saveBtn.onclick = () => {
        const key = input.value.trim();
        if (key) {
            localStorage.setItem('muapi_key', key);
            removeModal();
        }
    };

    modal.appendChild(title);
    modal.appendChild(label);
    modal.appendChild(input);

    btnContainer.appendChild(cancelBtn);
    btnContainer.appendChild(saveBtn);
    modal.appendChild(btnContainer);

    overlay.appendChild(modal);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) removeModal();
    });

    return overlay;
}
