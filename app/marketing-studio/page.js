"use client";

import MarketingStudio from '../../packages/studio/src/components/MarketingStudio';
import { securityService } from '../../src/lib/services/SecurityService';
import { useState, useEffect } from 'react';

export default function MarketingStudioPage() {
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    securityService.getDecryptedKey().then(key => {
      if (key) setApiKey(key);
    });
  }, []);

  return (
    <div className="h-full w-full bg-[#030303]">
      <MarketingStudio apiKey={apiKey} />
    </div>
  );
}