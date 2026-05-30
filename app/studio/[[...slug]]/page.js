"use client";

import { ImageStudio, VideoStudio, LipSyncStudio, CinemaStudio, MarketingStudio, WorkflowStudio, AgentStudio, AppsStudio, AudioStudio, AiClippingStudio } from 'studio';
import { useState, useEffect } from 'react';

const TABS = [
  { id: 'image', label: 'Image Studio' },
  { id: 'video', label: 'Video Studio' },
  { id: 'lipsync', label: 'Lip Sync' },
  { id: 'cinema', label: 'Cinema Studio' },
  { id: 'marketing', label: 'Marketing Studio' },
  { id: 'audio', label: 'Audio Studio' },
  { id: 'clipping', label: 'AI Clipping' },
  { id: 'workflows', label: 'Workflows' },
  { id: 'agents', label: 'Agents' },
  { id: 'apps', label: 'Explore Apps' },
];

export default function StudioPage({ params }) {
  const slug = params?.slug || [];
  const [activeTab, setActiveTab] = useState(slug[0] || 'image');
  const [apiKey, setApiKey] = useState(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('muapi_key');
      if (stored) setApiKey(stored);
    }
  }, []);

  if (!apiKey) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-white mb-4">Please set your MuAPI key in localStorage</h2>
          <button 
            className="bg-white text-black px-4 py-2 rounded"
            onClick={() => {
              const key = prompt('Enter MuAPI Key:');
              if (key) {
                localStorage.setItem('muapi_key', key);
                setApiKey(key);
              }
            }}
          >
            Enter API Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#030303] flex flex-col overflow-hidden text-white">
      <div className="h-14 border-b border-white/10 flex items-center justify-center gap-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-sm font-medium ${activeTab === tab.id ? 'text-[#d9ff00]' : 'text-white/50'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0">
        {activeTab === 'image' && <ImageStudio apiKey={apiKey} />}
        {activeTab === 'video' && <VideoStudio apiKey={apiKey} />}
        {activeTab === 'lipsync' && <LipSyncStudio apiKey={apiKey} />}
        {activeTab === 'cinema' && <CinemaStudio apiKey={apiKey} />}
        {activeTab === 'marketing' && <MarketingStudio apiKey={apiKey} />}
        {activeTab === 'audio' && <AudioStudio apiKey={apiKey} />}
        {activeTab === 'clipping' && <AiClippingStudio apiKey={apiKey} />}
        {activeTab === 'workflows' && <WorkflowStudio apiKey={apiKey} />}
        {activeTab === 'agents' && <AgentStudio apiKey={apiKey} />}
        {activeTab === 'apps' && <AppsStudio apiKey={apiKey} />}
      </div>
    </div>
  );
}