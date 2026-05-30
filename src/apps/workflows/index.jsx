'use client';

import React from 'react';
import { WorkflowStudio } from 'studio';
import { appManifest } from './manifest';

export default function WorkflowsApp({ apiKey }) {
  // If we're on the main workflows route (no id), render the full WorkflowStudio
  return React.createElement(WorkflowStudio, { apiKey });
}

export { appManifest } from './manifest';
