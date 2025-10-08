import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/',  // Changed from './' to '/' for Render deployment
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})