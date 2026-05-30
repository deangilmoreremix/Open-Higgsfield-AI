'use client';

import React, { useState, useEffect } from 'react';
import { appManifest } from './manifest';
import MarketingStudioComponent from '../../packages/studio/src/components/MarketingStudio.jsx';
import { securityService } from '../../../lib/services/SecurityService.js';

export default function MarketingStudioApp() {
  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    securityService.getDecryptedKey().then(key => {
      if (key) setApiKey(key);
    });
  }, []);

  return React.createElement(
    'div',
    { className: 'w-full h-full bg-[#030303]' },
    React.createElement(MarketingStudioComponent, { apiKey })
  );
}

export { appManifest } from './manifest';
export { routes as appRoutes } from './routes';