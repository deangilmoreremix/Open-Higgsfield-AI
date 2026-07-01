export function AuthModal(onSuccess) {
    // Defer to the single, centralized API key modal so all entry points
    // route through the same UI and storage. We only call onSuccess after
    // a key has actually been saved (or one already exists).
    import('./modals/ApiKeyCenterModal.jsx').then(({ openApiKeyCenterModal }) => {
      const handle = openApiKeyCenterModal({ name: 'muapi', mode: 'add' });
      if (onSuccess) {
        // Fire onSuccess once a key is in place
        const handler = (e) => {
          if (e?.detail?.name === 'muapi') {
            window.removeEventListener('api-key-changed', handler);
            try { onSuccess(); } catch (_) { /* ignore */ }
          }
        };
        window.addEventListener('api-key-changed', handler);
      }
      return handle;
    });
    return document.createElement('div');
}
