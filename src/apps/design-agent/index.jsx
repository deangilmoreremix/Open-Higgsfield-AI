'use client';

import React from 'react';
import { DesignAgentStudioFull } from 'studio';
import { appManifest } from './manifest';

export default function DesignAgentApp({ apiKey }) {
  return React.createElement(DesignAgentStudioFull, { apiKey });
}

export { appManifest } from './manifest';
