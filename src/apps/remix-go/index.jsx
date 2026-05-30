'use client';

import React from 'react';
import { VideoStudio } from 'studio';
import { appManifest } from './manifest';

export default function RemixGoApp({ apiKey }) {
  return React.createElement(VideoStudio, { apiKey });
}

export { appManifest } from './manifest';
export { routes as appRoutes } from './routes';
