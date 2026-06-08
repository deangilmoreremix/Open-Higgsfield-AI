import React from 'react';
import { createRoot } from 'react-dom/client';
import CinemaStudio from 'studio';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <CinemaStudio />
  </React.StrictMode>
);
