import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { compression } from 'vite-plugin-compression2'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Cloudflare Pages SPA fallback helper (generates 200.html and 404.html from index.html)
function spaFallbackPlugin() {
  return {
    name: 'spa-fallback-plugin',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist')
      const indexPath = path.join(distDir, 'index.html')
      const fallback200 = path.join(distDir, '200.html')
      const fallback404 = path.join(distDir, '404.html')
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, fallback200)
        fs.copyFileSync(indexPath, fallback404)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    spaFallbackPlugin(),
    compression({ algorithm: 'gzip', threshold: 1024 }),
  ],
  server: {
    port: 5174,
  },
  build: {
    // Enable CSS code splitting per async chunk
    cssCodeSplit: true,
    // Target modern browsers for smaller output
    target: 'es2020',
    // Chunk size warning threshold (300KB)
    chunkSizeWarningLimit: 300,
    rollupOptions: {
      output: {
        // Vendor chunk splitting for better caching (function form for Vite 8 / Rolldown)
        manualChunks(id) {
          if (id.includes('node_modules/react-dom')) return 'react-vendor';
          if (id.includes('node_modules/react/')) return 'react-vendor';
          if (id.includes('node_modules/react-router')) return 'router';
          if (id.includes('node_modules/lucide-react')) return 'icons';
          if (id.includes('node_modules/axios')) return 'http';
        },
        // Asset file naming for cache busting
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'chunks/[name]-[hash].js',
        entryFileNames: 'entries/[name]-[hash].js',
      },
    },
  },
})
