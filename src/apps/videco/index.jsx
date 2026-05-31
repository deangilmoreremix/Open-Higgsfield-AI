'use client';

import React from 'react';
import { VidecoStudio } from 'studio';
import { appManifest } from './manifest';

export default function VidecoApp({ apiKey }) {
  return React.createElement(VidecoStudio, { apiKey });
}

export { appManifest } from './manifest';
export { routes as appRoutes } from './routes';