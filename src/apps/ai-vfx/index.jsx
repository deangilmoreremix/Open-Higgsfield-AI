"use client";

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App.jsx';
import './components/styles/main.css';

function AIVFXNativeApp({ apiKey: propApiKey, ...props }) {
  return <App {...props} apiKey={propApiKey} />;
}

export function AIVFXApp(initialProps = {}) {
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
    React.createElement(AIVFXNativeApp, initialProps)
  );

  return container;
}

export default AIVFXApp;