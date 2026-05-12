import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/apps/agents/',
  plugins: [react(), tailwindcss()],
  envDir: '../..', // Load .env from Higgsfield root
  server: {
    port: 5176,
    host: true
  },
  build: {
    outDir: 'dist'
  }
})
