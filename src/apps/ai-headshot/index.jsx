import React from 'react';
import { createRoot } from 'react-dom/client';
import HeadshotPage from './HeadshotPage.js';

export function HeadshotApp() {
  const container = document.createElement('div');
  container.className = 'w-full h-full overflow-auto bg-black text-white';
  container.style.height = '100%';

  container._cleanup = () => {
    if (container._reactRoot) {
      container._reactRoot.unmount();
    }
  };

  const root = createRoot(container);
  container._reactRoot = root;

  root.render(
    React.createElement(HeadshotPage)
  );

  return container;
}

export default HeadshotApp;
