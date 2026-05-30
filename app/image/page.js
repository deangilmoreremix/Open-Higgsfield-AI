"use client";

import { useState, useEffect } from 'react';
import ImageStudio from '../../packages/studio/src/components/ImageStudio';
import { securityService } from '../../src/lib/services/SecurityService';

export default function ImagePage() {
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    securityService.getDecryptedKey().then(key => {
      if (key) setApiKey(key);
    });
  }, []);

  return (
    <div className="h-full w-full bg-[#030303]">
      <ImageStudio apiKey={apiKey} />
    </div>
  );
}