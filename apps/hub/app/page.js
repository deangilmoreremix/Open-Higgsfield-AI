'use client';
import { useState } from 'react';
import {
  Image as ImageIcon, Video, Music, Mic, Film, Scissors, Wand2,
  TrendingUp, GitBranch, Bot, Palette, Grid3x3, Terminal,
  User, Sparkles, VideoIcon, Workflow, Layers
} from 'lucide-react';

const STUDIOS = [
  { id: 'image', name: 'Image Studio', icon: ImageIcon, color: '#22d3ee', port: 3001, file: 'studio-image-studio' },
  { id: 'video', name: 'Video Studio', icon: Video, color: '#a855f7', port: 3002, file: 'studio-video-studio' },
  { id: 'audio', name: 'Audio Studio', icon: Music, color: '#f59e0b', port: 3003, file: 'studio-audio-studio' },
  { id: 'lipsync', name: 'Lip Sync', icon: Mic, color: '#10b981', port: 3004, file: 'studio-lipsync-studio' },
  { id: 'cinema', name: 'Cinema Studio', icon: Film, color: '#6366f1', port: 3005, file: 'studio-cinema-studio' },
  { id: 'clipping', name: 'AI Clipping', icon: Scissors, color: '#ef4444', port: 3006, file: 'studio-clipping-studio' },
  { id: 'vibe-motion', name: 'Vibe Motion', icon: Wand2, color: '#ec4899', port: 3007, file: 'studio-vibe-motion-studio' },
  { id: 'marketing', name: 'Marketing', icon: TrendingUp, color: '#f97316', port: 3008, file: 'studio-marketing-studio' },
  { id: 'workflow', name: 'Workflows', icon: GitBranch, color: '#8b5cf6', port: 3009, file: 'studio-workflow-studio' },
  { id: 'agents', name: 'Agents', icon: Bot, color: '#14b8a6', port: 3010, file: 'studio-agents-studio' },
  { id: 'design-agent', name: 'Design Agent', icon: Palette, color: '#f43f5e', port: 3011, file: 'studio-design-agent-studio' },
  { id: 'apps', name: 'Explore Apps', icon: Grid3x3, color: '#64748b', port: 3012, file: 'studio-explore-apps' },
  { id: 'mcp-cli', name: 'MCP CLI', icon: Terminal, color: '#84cc16', port: 3013, file: 'studio-mcp-cli-studio' },
];

const APPS = [
  { id: 'open-generative-ai', name: 'Open Generative AI', icon: Sparkles, color: '#22d3ee', path: '/', description: 'Main AI generation hub' },
  { id: 'ai-headshot', name: 'AI Headshot', icon: User, color: '#f59e0b', path: '/apps/ai-headshot-generator', description: 'AI headshot generator' },
  { id: 'ai-vfx', name: 'AI VFX', icon: VideoIcon, color: '#a855f7', path: '/apps/ai-vfx', description: 'AI video effects' },
  { id: 'videco', name: 'Videco Platform', icon: Layers, color: '#6366f1', path: '/apps/videco-ai-platform', description: 'Video creation platform' },
  { id: 'vibe-workflow', name: 'Vibe Workflow', icon: Workflow, color: '#8b5cf6', path: '/apps/vibe-workflow', description: 'Visual workflow builder' },
  { id: 'assistant', name: 'Assistant', icon: Bot, color: '#14b8a6', path: '/apps/assistant-app', description: 'AI assistant' },
];

export default function Page() {
  const [selectedStudio, setSelectedStudio] = useState(STUDIOS[0]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('studios');

  const studioUrl = `http://localhost:${selectedStudio.port}`;
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-[#0a0a0a] border-r border-white/5 flex flex-col transition-all duration-300 flex-shrink-0`}>
        {/* Logo */}
        <div className="h-14 flex items-center gap-3 px-4 border-b border-white/5">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          {!sidebarCollapsed && <span className="text-sm font-bold tracking-tight">AI Studios</span>}
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/5">
          <button onClick={() => setActiveTab('studios')} className={`flex-1 py-2 text-xs font-medium ${activeTab === 'studios' ? 'text-[#22d3ee] border-b-2 border-[#22d3ee]' : 'text-white/40'}`}>Studios</button>
          <button onClick={() => setActiveTab('apps')} className={`flex-1 py-2 text-xs font-medium ${activeTab === 'apps' ? 'text-[#22d3ee] border-b-2 border-[#22d3ee]' : 'text-white/40'}`}>Apps</button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-2">
          {activeTab === 'studios' ? (
            <div className="space-y-0.5 px-2">
              {STUDIOS.map((studio) => {
                const Icon = studio.icon;
                const isActive = selectedStudio.id === studio.id;
                return (
                  <button key={studio.id} onClick={() => setSelectedStudio(studio)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${isActive ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: studio.color + '20' }}>
                      <Icon size={16} style={{ color: studio.color }} />
                    </div>
                    {!sidebarCollapsed && <span className="text-[13px] font-medium truncate">{studio.name}</span>}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-0.5 px-2">
              {APPS.map((app) => {
                const Icon = app.icon;
                return (
                  <a key={app.id} href={app.path} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: app.color + '20' }}>
                      <Icon size={16} style={{ color: app.color }} />
                    </div>
                    {!sidebarCollapsed && <div className="min-w-0"><div className="text-[13px] font-medium truncate">{app.name}</div><div className="text-[10px] text-white/30 truncate">{app.description}</div></div>}
                  </a>
                );
              })}
            </div>
          )}
        </nav>

        {/* Collapse Button */}
        <div className="p-2 border-t border-white/5">
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="w-full py-2 text-xs text-white/30 hover:text-white transition-colors">
            {sidebarCollapsed ? '→' : '← Collapse'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="h-full flex flex-col">
          {/* Studio Header */}
          <div className="h-12 border-b border-white/5 flex items-center justify-between px-6 bg-black/20">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: selectedStudio.color + '20' }}>
                {(() => { const Icon = selectedStudio.icon; return <Icon size={14} style={{ color: selectedStudio.color }} />; })()}
              </div>
              <span className="text-sm font-bold">{selectedStudio.name}</span>
            </div>
            <a href={studioUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-white/30 hover:text-white transition-colors">Open standalone →</a>
          </div>
          {/* Iframe */}
          <div className="flex-1 bg-black">
            <iframe src={studioUrl} className="w-full h-full border-0" title={selectedStudio.name} sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
          </div>
        </div>
      </main>
    </div>
  );
}