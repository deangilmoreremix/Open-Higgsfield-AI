"use client";

import { useState, useEffect } from 'react';
import { securityService } from '../../src/lib/services/SecurityService';

export default function DesignAgentPage() {
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
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#030303] p-8">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
          <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h14a2 2 0 002-2v-7a2 2 0 00-2-2h-4l-2-2-2 2H7a2 2 0 00-2 2v7a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Design Agent</h1>
        <p className="text-white/60 mb-6">
          AI-powered design tool for posters, social graphics, brand identities, and creative assets.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm text-primary font-medium">Coming Soon</span>
        </div>
      </div>
    </div>
  );
}