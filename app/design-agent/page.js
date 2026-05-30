"use client";

import { useState, useEffect } from 'react';
import { DesignAgentStudio } from 'studio';

export default function DesignAgentPage() {
  const [apiKey, setApiKey] = useState(null);
  const [designAgentAvailable, setDesignAgentAvailable] = useState(false);
  const [checking, setChecking] = useState(true);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('muapi_key');
      if (stored) setApiKey(stored);
    }
  }, []);

  useEffect(() => {
    // Check if design-agent package is available
    if (apiKey) {
      import('design-agent')
        .then(() => setDesignAgentAvailable(true))
        .catch(() => setDesignAgentAvailable(false))
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, [apiKey]);

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

  if (checking) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/5 border-t-[#d9ff00] rounded-full animate-spin" />
      </div>
    );
  }

  // If design-agent package is available, load the studio
  if (designAgentAvailable) {
    return (
      <div className="h-screen bg-[#030303] flex flex-col overflow-hidden text-white">
        <DesignAgentStudio apiKey={apiKey} />
      </div>
    );
  }

  // Fallback when design-agent package is not available
  return (
    <div className="h-screen bg-black flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#d9ff00]/10 flex items-center justify-center">
          <svg className="w-10 h-10 text-[#d9ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Design Agent</h1>
        <p className="text-white/60 mb-8">AI-powered design canvas with generative capabilities</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d9ff00]/10 border border-[#d9ff00]/20">
          <span className="w-2 h-2 rounded-full bg-[#d9ff00] animate-pulse"></span>
          <span className="text-sm text-[#d9ff00] font-medium">Design Agent Package Required</span>
        </div>
        <p className="text-white/40 text-xs mt-4 max-w-xs">
          The design-agent package is required for full functionality. Install it to access the AI design canvas.
        </p>
        <a href="/" className="mt-6 inline-block text-[#d9ff00] text-sm">Return to Studio</a>
      </div>
    </div>
  );
}