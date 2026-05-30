"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { AgentStudio } from 'studio';

const STORAGE_KEY = "muapi_key";

export default function AgentChatClient({ agentDetails, initialHistory, userData }) {
  const [apiKey, setApiKey] = useState(null);
  const interceptorRef = useRef(null);
  
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
  
  useEffect(() => {
    const key = apiKey || (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY));
    if (!key) return;
    interceptorRef.current = axios.interceptors.request.use((config) => {
      const isRelative = config.url.startsWith("/") || !config.url.startsWith("http");
      const isInternalProxy = config.url.includes('/api/app') || config.url.includes('/api/workflow') || config.url.includes('/api/agents') || config.url.includes('/api/api') || config.url.includes('/api/v1');
      if (isRelative || isInternalProxy) {
        config.headers["x-api-key"] = key;
      }
      return config;
    });
    return () => {
      if (interceptorRef.current !== null) {
        axios.interceptors.request.eject(interceptorRef.current);
      }
    };
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

  return (
    <div className="h-screen bg-[#030303] flex flex-col overflow-hidden text-white">
      <AgentStudio apiKey={apiKey} />
    </div>
  );
}