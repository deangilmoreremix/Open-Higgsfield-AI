'use client';

import React from 'react';
import { MarketingStudio } from 'studio';
import { appManifest } from './manifest';

export default function MarketingStudioApp({ apiKey }) {
  return React.createElement(MarketingStudio, { apiKey });
}

export { appManifest } from './manifest';
