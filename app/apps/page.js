"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AppsHub() {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    import('../../src/lib/appRegistry').then(async ({ appRegistry }) => {
      const list = await appRegistry.getAllApps();
      setApps(list);
    }).catch(() => {
      setApps([]);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#030303] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-sm text-white/50 hover:text-white">← Back to Dashboard</Link>
          <h1 className="text-4xl font-black mt-2">All Apps</h1>
          <p className="text-white/60 mt-1">Browse and launch every tool in the Higgsfield ecosystem.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map(app => (
            <Link
              key={app.id}
              href={app.route || `/apps/${app.id}`}
              className="bg-[#111] border border-white/10 rounded-2xl p-6 hover:border-[#d9ff00]/40 transition-colors"
            >
              <div className="text-2xl mb-3">{app.icon || '🛠️'}</div>
              <div className="font-bold text-lg">{app.name}</div>
              <div className="text-sm text-white/60 mt-1 line-clamp-2">{app.description}</div>
              <div className="mt-4 text-xs uppercase tracking-widest text-[#d9ff00]">{app.category}</div>
            </Link>
          ))}
          {apps.length === 0 && (
            <div className="text-white/40">No apps registered yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}