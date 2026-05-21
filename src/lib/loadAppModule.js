'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';

const loadingStates = new Map();

async function loadAppModuleInternal(appId) {
  if (loadingStates.has(appId)) {
    return loadingStates.get(appId);
  }

  const loadPromise = import(`../apps/${appId}/index.jsx`)
    .then(mod => {
      const Component = mod.default;
      loadingStates.set(appId, Component);
      return Component;
    })
    .catch(err => {
      console.error(`[AppModuleLoader] Failed to load app ${appId}:`, err);
      throw err;
    });

  loadingStates.set(appId, loadPromise);
  return loadPromise;
}

export function loadAppModule(appId) {
  return loadAppModuleInternal(appId);
}

export function AppModuleLoader({ appId, fallback, errorFallback, ...props }) {
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    setError(null);

    loadAppModuleInternal(appId)
      .then(LoadedComponent => {
        if (mounted) {
          setComponent(() => LoadedComponent);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [appId]);

  if (loading) {
    return fallback || React.createElement(
      'div',
      { className: 'w-full h-full flex items-center justify-center bg-[#030303]' },
      React.createElement(
        'div',
        { className: 'flex flex-col items-center gap-4' },
        React.createElement(
          'div',
          {
            className: 'w-10 h-10 border-2 border-[#d9ff00] border-t-transparent rounded-full animate-spin',
          }
        ),
        React.createElement(
          'span',
          { className: 'text-sm text-white/60' },
          'Loading app...'
        )
      )
    );
  }

  if (error) {
    return errorFallback || React.createElement(
      'div',
      { className: 'w-full h-full flex items-center justify-center bg-[#030303]' },
      React.createElement(
        'div',
        { className: 'flex flex-col items-center gap-4 text-center p-8' },
        React.createElement(
          'div',
          { className: 'w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center' },
          React.createElement(
            'svg',
            { className: 'w-6 h-6 text-red-400', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
            React.createElement('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: 'M6 18L18 6M6 6l12 12' })
          )
        ),
        React.createElement('h3', { className: 'text-lg font-medium text-white' }, 'Failed to load app'),
        React.createElement('p', { className: 'text-sm text-white/60 max-w-md' }, error.message)
      )
    );
  }

  if (!Component) {
    return null;
  }

  return React.createElement(Component, props);
}

export function createLazyApp(appId) {
  return lazy(() => import(`../apps/${appId}/index.jsx`));
}

export default { loadAppModule, AppModuleLoader, createLazyApp };
