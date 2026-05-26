"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { loadAppModule } from '../../../src/lib/loadAppModule';
import { appRegistry } from '../../../src/lib/appRegistry';

export default function DynamicAppPage() {
  const params = useParams();
  const appId = params?.appId;
  const slug = params?.slug || [];

  const [AppComponent, setAppComponent] = useState(null);
  const [appMeta, setAppMeta] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!appId) return;

    (async () => {
      const meta = await appRegistry.getApp(appId);
      setAppMeta(meta);

      loadAppModule(appId)
      .then((mod) => {
        if (mod && typeof mod === 'function') {
          setAppComponent(() => mod);
        } else if (mod && mod.default) {
          setAppComponent(() => mod.default);
        } else {
          // Fallback shell
          setAppComponent(() => () => (
            <div className="min-h-screen bg-[#030303] flex items-center justify-center p-8">
              <div className="max-w-md text-center">
                <div className="text-5xl mb-6">{meta?.icon || '🛠️'}</div>
                <h1 className="text-3xl font-bold mb-2">{meta?.name || appId}</h1>
                <p className="text-white/60 mb-8">{meta?.description || 'This app is loading...'}</p>
                <div className="text-xs text-white/40">Full implementation coming soon.</div>
              </div>
            </div>
          ));
        }
      })
      .catch((err) => {
        console.error('Failed to load app module:', err);
        setError(err.message);
      });
    })();
  }, [appId]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center p-8 text-center">
        <div>
          <div className="text-red-400 mb-4">Failed to load {appId}</div>
          <div className="text-white/60 text-sm">{error}</div>
          <a href="/" className="mt-6 inline-block text-[#d9ff00]">Return to dashboard</a>
        </div>
      </div>
    );
  }

  if (!AppComponent) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-white/60">
          <div className="animate-spin w-4 h-4 border-2 border-[#d9ff00] border-t-transparent rounded-full" />
          Loading {appMeta?.name || appId}...
        </div>
      </div>
    );
  }

  // Pass any sub-route slug as props
  return <AppComponent params={{ slug }} />;
}