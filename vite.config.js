import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],


   optimizeDeps: {
    exclude: ['@xenova/transformers', 'fs', 'path', 'uuid']
  },
  
  // Handle Node.js modules
  ssr: {
    noExternal: ['@xenova/transformers']
  }
})
