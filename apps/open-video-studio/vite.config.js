import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  resolve: {
    alias: {
      studio: path.resolve(__dirname, '../open-generative-ai/packages/studio/src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 0,
    strictPort: true,
  },
});
