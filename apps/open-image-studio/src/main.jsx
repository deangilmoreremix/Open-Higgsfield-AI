import React from 'react';
import { createRoot } from 'react-dom/client';
import ImageStudio from 'studio';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ImageStudio />
  </React.StrictMode>
);
