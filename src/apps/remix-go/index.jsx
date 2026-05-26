'use client';

import React from 'react';
import { appManifest } from './manifest';

export default function RemixGoApp() {
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
            d: 'M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z',
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
