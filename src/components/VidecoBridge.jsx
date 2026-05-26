import React from 'react';
import { createRoot } from 'react-dom/client';
import VidecoOutreachApp from './VidecoOutreachApp';

export function VidecoOutreachPage() {
  const container = document.createElement('div');
  container.className = 'w-full h-full overflow-auto';
  container.style.height = '100%';

  container._cleanup = () => {
    if (container._reactRoot) {
      container._reactRoot.unmount();
    }
  };

  const root = createRoot(container);
  container._reactRoot = root;

  root.render(
    React.createElement(VidecoOutreachApp)
  );

  return container;
}

export default VidecoOutreachPage;
