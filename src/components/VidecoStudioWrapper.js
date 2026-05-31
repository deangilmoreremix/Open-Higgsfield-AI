"use client";

import React from 'react';
import { useState, useEffect } from 'react';
import VidecoApp from '../apps/videco/index.jsx';

export default function VidecoStudioWrapper() {
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('muapi_key');
      if (stored) setApiKey(stored);
    }
  }, []);

  if (!apiKey) {
    return React.createElement('div', { className: 'h-screen bg-black flex items-center justify-center' },
      React.createElement('div', { className: 'text-center' },
        React.createElement('h2', { className: 'text-white mb-4' }, 'Please set your MuAPI key in localStorage'),
        React.createElement('button', {
          className: 'bg-white text-black px-4 py-2 rounded',
          onClick: () => {
            const key = prompt('Enter MuAPI Key:');
            if (key) {
              localStorage.setItem('muapi_key', key);
              setApiKey(key);
            }
          }
        }, 'Enter API Key')
      )
    );
  }

  return React.createElement(VidecoApp, { apiKey });
}