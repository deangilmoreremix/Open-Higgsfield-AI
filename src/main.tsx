import React from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import App from './App.tsx';

const container = document.querySelector('#app');
if (!container) {
  throw new Error('App container not found');
}

const root = createRoot(container);

const path = window.location.pathname;
const hash = window.location.hash;
let initialRoute = '/';

if (path === '/' || path === '') {
  if (hash && hash.startsWith('#/')) {
    const hashRoute = hash.slice(2).split('?')[0];
    if (hashRoute) initialRoute = '/' + hashRoute;
  }
} else {
  initialRoute = path;
}

root.render(<App initialRoute={initialRoute} />);