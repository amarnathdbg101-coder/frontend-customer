import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { compression } from 'vite-plugin-compression2'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'gzip', threshold: 1024 }),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
      title: 'ShopSilo Customer Frontend Bundle Analysis',
    }),
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
