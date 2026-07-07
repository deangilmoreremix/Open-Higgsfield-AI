import './style.css';
import { initOnboarding } from './onboarding.js';
import { Header } from './components/Header.js';
import { Sidebar } from './components/Sidebar.js';
import { initRouter, navigate } from './lib/router.js';

// Main initialization - wrapped in async IIFE to allow early returns
(async () => {
  try {
    const app = document.querySelector('#app');
    if (!app) throw new Error('App container not found');
    
    app.innerHTML = '';
    
    // Navigate to initial page
    const path = window.location.pathname;
    const hash = window.location.hash;
    let initialPage = 'landing';
    
    if (path === '/' || path === '') {
      initialPage = 'landing';
    } else if (path.startsWith('/')) {
      initialPage = path.slice(1);
    }
    
    if (hash && hash.startsWith('#/')) {
      const hashPage = hash.slice(2);
      if (hashPage) initialPage = hashPage;
    }

    // Landing page: full-page without app shell
    if (initialPage === 'landing') {
      const LandingPageMod = await import('./components/landing/LandingPage.jsx');
      const LandingPage = LandingPageMod.default || LandingPageMod;
      const landingPage = await LandingPage();
      app.appendChild(landingPage);
      console.log('[App] Landing page rendered');
      return;
    }
    
    if (initialPage === 'signin') {
      const SignInPageMod = await import('./components/landing/SignInPage.jsx');
      const SignInPage = SignInPageMod.default || SignInPageMod;
      const signInPage = SignInPage();
      app.appendChild(signInPage);
      console.log('[App] Sign in page rendered');
      return;
    }

    // Standard app shell for editor pages
    const header = Header((page) => navigate(page));
    const headerEl = header.element;
    const updateHeaderActive = header.updateActiveStates;
    app.appendChild(headerEl);

    const body = document.createElement('div');
    body.className = 'flex flex-1';

    const sidebar = Sidebar((page) => navigate(page));
    body.appendChild(sidebar);

    const contentArea = document.createElement('main');
    contentArea.id = 'content-area';
    contentArea.setAttribute('data-testid', 'content-area');
    contentArea.className = 'flex-1 relative w-full flex flex-col bg-app-bg';
    body.appendChild(contentArea);

    app.appendChild(body);

    initRouter(contentArea, (page) => {
      updateHeaderActive(page);
      sidebar.dispatchEvent(new CustomEvent('route-changed', { detail: { page } }));
    });
    
    console.log('[App] App shell rendered, navigating to:', initialPage);
    navigate(initialPage);

    // Defer onboarding until after render
    setTimeout(() => initOnboarding(), 1000);

    // Initialize global personalizer floating button (React component)
    // Wrapped in its own try/catch so a failure here (e.g. missing Supabase
    // env vars causing the dialog module to throw on import) does not crash
    // the entire app shell.
    try {
      const React = await import('react');
      const { createRoot } = await import('react-dom/client');
      const { default: GlobalPersonalizerButton } = await import('./components/personalizer/GlobalPersonalizerButton.js');
      const personalizerHost = document.createElement('div');
      personalizerHost.id = 'global-personalizer-host';
      personalizerHost.setAttribute('data-testid', 'global-personalizer-host');
      document.body.appendChild(personalizerHost);
      const personalizerRoot = createRoot(personalizerHost);
      personalizerRoot.render(React.createElement(GlobalPersonalizerButton));
    } catch (personalizerError) {
      console.warn('[App] Failed to initialize global personalizer button:', personalizerError?.message || personalizerError);
    }
    
  } catch (error) {
    console.error('[App] Fatal initialization error:', error);
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #000; color: #fff; flex-direction: column; padding: 20px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 20px;">😕</div>
        <h1 style="color: #ff4444; margin-bottom: 20px;">Application Error</h1>
        <p style="color: #aaa; max-width: 600px; margin-bottom: 20px;">${error.message}</p>
        <button onclick="location.reload()" style="padding: 12px 24px; background: #3b82f6; border: none; border-radius: 8px; color: white; cursor: pointer; font-weight: bold;">Reload Page</button>
      </div>
    `;
  }
})();

// Global navigation handler
window.addEventListener('navigate', (e) => {
  if (e.detail.page === 'settings') {
    import('./components/SettingsModal.js').then(({ SettingsModal }) => {
      document.body.appendChild(SettingsModal());
    });
  } else {
    navigate(e.detail.page);
  }
});

// Expose navigate globally for debugging
window.navigate = navigate;
