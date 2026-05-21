'use client';

import React from 'react';
import { appManifest } from './manifest';

export default function MarketingStudioApp() {
  return React.createElement(
    'div',
    { className: 'w-full h-full flex items-center justify-center bg-[#030303] p-8' },
    React.createElement(
      'div',
      { className: 'max-w-md w-full text-center' },
      React.createElement(
        'div',
        {
          className: 'w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#d9ff00]/10 flex items-center justify-center',
        },
        React.createElement(
          'svg',
          { className: 'w-10 h-10 text-[#d9ff00]', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
          React.createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 1.5,
            d: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
          })
        )
      ),
      React.createElement('h1', { className: 'text-2xl font-bold text-white mb-2' }, appManifest.name),
      React.createElement('p', { className: 'text-white/60 mb-8' }, appManifest.description),
      React.createElement(
        'div',
        {
          className: 'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d9ff00]/10 border border-[#d9ff00]/20',
        },
        React.createElement('span', { className: 'w-2 h-2 rounded-full bg-[#d9ff00] animate-pulse' }),
        React.createElement('span', { className: 'text-sm text-[#d9ff00] font-medium' }, 'Coming Soon')
      )
    )
  );
}

export { appManifest } from './manifest';
export { routes as appRoutes } from './routes';
