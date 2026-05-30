'use client';

import React from 'react';
import { WorkflowStudio } from 'studio';
import { appManifest } from './manifest';

export default function VibeWorkflowApp({ apiKey }) {
  return React.createElement(WorkflowStudio, { apiKey });
}

export { appManifest } from './manifest';
export { routes as appRoutes } from './routes';
