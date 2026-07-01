import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

export function StoryboarderApp() {
  const container = document.createElement('div');
  container.className = 'w-full h-full bg-[#0a0a0a] text-white overflow-hidden';
  container.style.height = '100%';

  container._cleanup = () => {
    if (container._reactRoot) {
      container._reactRoot.unmount();
    }
  };

  const root = createRoot(container);
  container._reactRoot = root;

  root.render(
    React.createElement(
      React.StrictMode,
      null,
      React.createElement(App)
    )
  );

  return container;
}

export default StoryboarderApp;
