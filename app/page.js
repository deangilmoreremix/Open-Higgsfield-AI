"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function HiggsfieldHome() {
  const [apps, setApps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApps = async () => {
      try {
        // Dynamically import to avoid SSR issues with registry
        const { appRegistry } = await import('../src/lib/appRegistry');
        const allApps = await appRegistry.getAllApps();
        const cats = ['all', ...new Set(allApps.map(a => a.category).filter(Boolean))];
        
        setApps(allApps);
        setCategories(cats);
      } catch (e) {
        console.error('Failed to load app registry', e);
        // Fallback: show core known apps
        setApps([
          { id: 'image', name: 'Image Studio', description: 'Generate and edit images with 200+ models', category: 'image', route: '/image', status: 'complete' },
          { id: 'video', name: 'Video Studio', description: 'Text-to-video and image-to-video generation', category: 'video', route: '/video', status: 'complete' },
          { id: 'ai-vfx', name: 'AI-VFX Studio', description: '37 cinematic AI visual effects', category: 'vfx', route: '/ai-vfx', status: 'complete' },
          { id: 'cinema', name: 'Cinema Studio', description: 'Professional cinematic tools', category: 'cinema', route: '/cinema', status: 'complete' },
          { id: 'workflows', name: 'Workflows', description: 'Visual AI workflow builder', category: 'workflow', route: '/workflows', status: 'complete' },
          { id: 'agents', name: 'AI Agents', description: 'Autonomous AI agents and conversations', category: 'ai', route: '/agents', status: 'complete' },
        ]);
        setCategories(['all', 'image', 'video', 'vfx', 'cinema', 'workflow', 'ai']);
      }
      setIsLoading(false);
    };
    loadApps();
  }, []);

  const filteredApps = apps
    .filter(app => {
      const matchesCategory = activeCategory === 'all' || app.category === activeCategory;
      const matchesSearch = !searchQuery || 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => (a.status === 'complete' ? -1 : 1) - (b.status === 'complete' ? -1 : 1));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#d9ff00] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {/* Top Navigation */}
      <nav className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#d9ff00] rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-xl">H</span>
            </div>
            <div>
              <div className="font-bold tracking-tight">Higgsfield</div>
              <div className="text-[10px] text-white/40 -mt-1">AI CREATIVE STUDIO</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Link href="/studio" className="px-4 py-1.5 rounded-full border border-white/20 hover:bg-white/5 transition-colors">
              Classic Studio
            </Link>
            <Link href="/apps" className="px-4 py-1.5 rounded-full bg-white text-black font-medium">
              All Apps
            </Link>
            <Link href="/settings" className="px-4 py-1.5 rounded-full border border-white/20 hover:bg-white/5 transition-colors">
              Settings
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs mb-4">
          50+ AI TOOLS • ONE WORKSPACE
        </div>
        <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-4">
          The complete<br />AI creative studio.
        </h1>
        <p className="text-xl text-white/60 max-w-2xl mx-auto">
          Professional tools for image, video, cinema, VFX, workflows, agents, and more.
          Built for creators who need power without compromise.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="max-w-7xl mx-auto px-6 pb-8 sticky top-16 z-40 bg-[#030303]/95 backdrop-blur-xl py-4 border-b border-white/10">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#d9ff00]/50"
          />
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all border ${
                  activeCategory === cat 
                    ? 'bg-[#d9ff00] text-black border-[#d9ff00]' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* App Grid */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredApps.length > 0 ? (
            filteredApps.map(app => (
              <Link
                key={app.id}
                href={app.route || `/apps/${app.id}`}
                className="group block bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 hover:border-[#d9ff00]/40 hover:bg-[#111] transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{app.icon || '⚡'}</div>
                  {app.status === 'shell' && (
                    <div className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">COMING SOON</div>
                  )}
                </div>
                
                <h3 className="font-bold text-xl mb-1.5 group-hover:text-[#d9ff00] transition-colors">{app.name}</h3>
                <p className="text-sm text-white/60 line-clamp-2 mb-4">{app.description || 'Professional AI tool'}</p>
                
                <div className="flex items-center gap-2 text-xs text-white/40">
                  {app.category && <span className="uppercase tracking-widest">{app.category}</span>}
                  {app.features && app.features.length > 0 && (
                    <span>• {app.features.length} features</span>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-white/40">
              No apps found matching your search.
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 mt-12 py-8 text-center text-xs text-white/40">
        Higgsfield AI — Professional creative tools powered by MuAPI, OpenAI, and custom models.
      </div>
    </div>
  );
}