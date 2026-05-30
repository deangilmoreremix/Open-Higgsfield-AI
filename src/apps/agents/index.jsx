'use client';

import React from 'react';
import { AgentStudio } from 'studio';
import { appManifest } from './manifest';

export default function AgentsApp({ apiKey }) {
  return React.createElement(AgentStudio, { apiKey });
}

export { appManifest } from './manifest';
