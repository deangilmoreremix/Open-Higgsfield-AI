'use client';

import React from 'react';
import { appManifest } from './manifest';

export default function AIHeadshotGeneratorApp() {
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
            d: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z',
          }),
          React.createElement('path', {
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: 1.5,
            d: 'M15 13a3 3 0 11-6 0 3 3 0 016 0z',
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
