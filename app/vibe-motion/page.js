"use client";

import AiClippingStudio from '../../packages/studio/src/components/AiClippingStudio';
import { securityService } from '../../src/lib/services/SecurityService';
import { useState, useEffect } from 'react';

export default function VibeMotionPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    securityService.getDecryptedKey().then(() => {
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
      <AiClippingStudio />
    </div>
  );
}