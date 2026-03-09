import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',   // relative paths so Electron can load files from disk
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
  optimizeDeps: {
    // Essentia uses emscripten output that esbuild can't pre-bundle reliably.
    // Exclude it so Vite serves the files directly from node_modules.
    exclude: ['essentia.js'],
  },
})
