"use client";

import { useState, useEffect } from 'react';
import { WorkflowStudio } from 'studio';

export default function WorkflowsPage() {
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
      <WorkflowStudio apiKey={apiKey} />
    </div>
  );
}