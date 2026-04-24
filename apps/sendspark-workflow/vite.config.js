import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',
  envDir: '../../', // Load .env from repository root
  server: {
    port: 8084,
    host: '0.0.0.0'
  }
});