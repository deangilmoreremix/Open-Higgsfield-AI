'use client';

import React, { useState, useEffect } from 'react';
import { appManifest } from './manifest';
import { securityService } from '../../../lib/services/SecurityService.js';

export default function DesignAgentApp() {
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    securityService.getDecryptedKey().then(key => {
      if (key) setApiKey(key);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return React.createElement(
      'div',
      { className: 'w-full h-full flex items-center justify-center bg-[#030303]' },
      React.createElement('div', { className: 'animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full' })
    );
  }

  // The design-agent package is a separate component - for now show placeholder
  return React.createElement(
    'div',
    { className: 'w-full h-full flex flex-col items-center justify-center bg-[#030303] p-8' },
    React.createElement(
      'div',
      { className: 'text-center max-w-lg' },
      React.createElement(
        'div',
        { className: 'w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center' },
        React.createElement(
          'svg',
          { className: 'w-10 h-10 text-primary', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
          React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 1.5, d: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' }),
          React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 1.5, d: 'M15 13a3 3 0 11-6 0 3 3 0 016 0z' })
        )
      ),
      React.createElement('h1', { className: 'text-2xl font-bold text-white mb-2' }, appManifest.name),
      React.createElement('p', { className: 'text-white/60 mb-6' }, appManifest.description),
      React.createElement(
        'div',
        { className: 'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20' },
        React.createElement('span', { className: 'w-2 h-2 rounded-full bg-primary animate-pulse' }),
        React.createElement('span', { className: 'text-sm text-primary font-medium' }, 'Coming Soon')
      )
    )
  );
}

export { appManifest } from './manifest';
export { routes as appRoutes } from './routes';