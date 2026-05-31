'use client';

import React from 'react';
import { PomelliStudio } from 'studio';
import { appManifest } from './manifest';

export default function OpenPomelliApp({ apiKey }) {
  return React.createElement(PomelliStudio, { apiKey });
}

export { appManifest } from './manifest';
export { routes as appRoutes } from './routes';
