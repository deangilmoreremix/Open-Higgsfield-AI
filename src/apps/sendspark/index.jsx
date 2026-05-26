"use client";

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App.jsx';

function SendsparkNativeApp(props) {
  return <App {...props} />;
}

export function SendsparkApp(initialProps = {}) {
  const container = document.createElement('div');
  container.className = 'w-full h-full overflow-auto bg-gray-950';
  container.style.height = '100%';

  container._cleanup = () => {
    if (container._reactRoot) {
      container._reactRoot.unmount();
    }
  };

  const root = createRoot(container);
  container._reactRoot = root;

  root.render(
    React.createElement(SendsparkNativeApp, initialProps)
  );

  return container;
}

export default SendsparkApp;
