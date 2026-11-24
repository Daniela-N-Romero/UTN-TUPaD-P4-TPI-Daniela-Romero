import { defineConfig } from "vite";
import react from '@vitejs/plugin-react'
import path from 'path';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@features': path.resolve(import.meta.dirname, './src/features'),
      '@shared': path.resolve(import.meta.dirname, './src/shared'),
      '@store': path.resolve(import.meta.dirname, './src/store'),
      '@routes': path.resolve(import.meta.dirname, './src/routes'),
    },
  },
  
})