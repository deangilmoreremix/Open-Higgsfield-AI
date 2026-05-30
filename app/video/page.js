"use client";

import { useState, useEffect } from 'react';
import VideoStudio from '../../packages/studio/src/components/VideoStudio';
import { securityService } from '../../src/lib/services/SecurityService';

export default function VideoPage() {
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    securityService.getDecryptedKey().then(key => {
      if (key) setApiKey(key);
    });
  }, []);

  return (
    <div className="h-full w-full bg-[#030303]">
      <VideoStudio apiKey={apiKey} />
    </div>
  );
}