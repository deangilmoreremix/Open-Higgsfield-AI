'use client';

import React from 'react';
import { DesignAgentStudio } from 'studio';
import { appManifest } from './manifest';

export default function DesignAgentApp({ apiKey }) {
  // Note: DesignAgentStudio requires the 'design-agent' external package
  // which may not be available in all environments
  try {
    return React.createElement(DesignAgentStudio, { apiKey });
  } catch (err) {
    // Fallback to placeholder if design-agent package is not available
    console.warn('DesignAgentStudio not available, showing placeholder:', err.message);
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
              d: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
            })
          )
        ),
        React.createElement('h1', { className: 'text-2xl font-bold text-white mb-2' }, appManifest.name),
        React.createElement('p', { className: 'text-white/60 mb-8' }, appManifest.description),
        React.createElement(
          'div',
          { className: 'inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d9ff00]/10 border border-[#d9ff00]/20' },
          React.createElement('span', { className: 'w-2 h-2 rounded-full bg-[#d9ff00] animate-pulse' }),
          React.createElement('span', { className: 'text-sm text-[#d9ff00] font-medium' }, 'Design Agent Package Required')
        )
      )
    );
  }
}

export { appManifest } from './manifest';
