"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { AgentStudio } from 'studio';

const STORAGE_KEY = "muapi_key";

export default function AgentCreateClient() {
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    const getKey = () => {
      if (typeof window === "undefined") return null;
      const fromStorage = localStorage.getItem(STORAGE_KEY);
      if (fromStorage) return fromStorage;
      const match = document.cookie.match(/muapi_key=([^;]+)/);
      return match ? match[1] : null;
    };
    
    const key = getKey();
    if (key) setApiKey(key);
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
      <AgentStudio apiKey={apiKey} />
    </div>
  );
}