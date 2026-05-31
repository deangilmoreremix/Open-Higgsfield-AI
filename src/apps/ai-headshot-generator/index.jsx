'use client';

import React from 'react';
import { HeadshotStudio } from 'studio';
import { appManifest } from './manifest';

export default function AIHeadshotGeneratorApp({ apiKey }) {
  return React.createElement(HeadshotStudio, { apiKey });
}

export { appManifest } from './manifest';
export { routes as appRoutes } from './routes';
