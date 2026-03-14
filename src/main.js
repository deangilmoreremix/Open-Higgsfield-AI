import './style.css';
import { Header } from './components/Header.js';
import { Sidebar } from './components/Sidebar.js';
import { initRouter, navigate } from './lib/router.js';

console.log('[App] Starting initialization...');

try {
  const app = document.querySelector('#app');
  if (!app) {
    throw new Error('App container not found');
  }

  app.innerHTML = '';

  const headerEl = Header((page) => navigate(page));
  app.appendChild(headerEl);

  const body = document.createElement('div');
  body.className = 'flex flex-1 overflow-hidden';

  const sidebar = Sidebar((page) => navigate(page));
  body.appendChild(sidebar);

  const contentArea = document.createElement('main');
  contentArea.id = 'content-area';
  contentArea.className = 'flex-1 relative w-full overflow-hidden flex flex-col bg-app-bg';
  body.appendChild(contentArea);

  app.appendChild(body);

  initRouter(contentArea, (page) => {
    headerEl.dispatchEvent(new CustomEvent('route-changed', { detail: { page } }));
    sidebar.dispatchEvent(new CustomEvent('route-changed', { detail: { page } }));
  });

  console.log('[App] Navigating to image studio...');
  navigate('image');
} catch (error) {
  console.error('[App] Fatal initialization error:', error);
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #000; color: #fff; flex-direction: column; padding: 20px; text-align: center;">
      <h1 style="color: #ff4444; margin-bottom: 20px;">Application Error</h1>
      <p style="color: #aaa; max-width: 600px;">${error.message}</p>
      <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; border: none; border-radius: 8px; color: white; cursor: pointer;">Reload Page</button>
    </div>
  `;
}

window.addEventListener('navigate', (e) => {
  if (e.detail.page === 'settings') {
    import('./components/SettingsModal.js').then(({ SettingsModal }) => {
      document.body.appendChild(SettingsModal());
    });
  } else {
    navigate(e.detail.page);
  }
});
