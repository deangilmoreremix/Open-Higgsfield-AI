'use client';

import React from 'react';
import { ImageStudio } from 'studio';
import { appManifest } from './manifest';

export default function AIHeadshotGeneratorApp({ apiKey }) {
  return React.createElement(ImageStudio, { apiKey });
}

export { appManifest } from './manifest';
export { routes as appRoutes } from './routes';
