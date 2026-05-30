"use client";

import { useState, useEffect } from 'react';
import CinemaStudio from '../../packages/studio/src/components/CinemaStudio';
import { securityService } from '../../src/lib/services/SecurityService';

export default function CinemaPage() {
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    securityService.getDecryptedKey().then(key => {
      if (key) setApiKey(key);
    });
  }, []);

  return (
    <div className="h-full w-full bg-[#030303]">
      <CinemaStudio apiKey={apiKey} />
    </div>
  );
}