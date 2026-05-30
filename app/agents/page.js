"use client";

import { useState, useEffect } from 'react';
import AgentStudio from '../../packages/studio/src/components/AgentStudio';
import { securityService } from '../../src/lib/services/SecurityService';

export default function AgentsPage() {
  const [apiKey, setApiKey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    securityService.getDecryptedKey().then(key => {
      if (key) setApiKey(key);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#030303]">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#030303]">
      <AgentStudio apiKey={apiKey} />
    </div>
  );
}