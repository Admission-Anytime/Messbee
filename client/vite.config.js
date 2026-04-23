import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Optimize babel transforms
      babel: {
        plugins: [
          // Add babel plugins if needed
        ]
      }
    })
  ],
  
  resolve: {
    dedupe: ['apexcharts']
  },
  
  // Build optimizations
  build: {
    // Target modern browsers for smaller bundle
    target: 'esnext',
    
    // Enable minification with esbuild (faster than terser)
    minify: 'esbuild',
    
    // esbuild options
    esbuild: {
      drop: ['console', 'debugger'], // Remove console.logs and debuggers in production
    },
    
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@mui/x-charts', '@mui/x-data-grid', '@mui/x-date-pickers', '@emotion/react', '@emotion/styled'],
          'icon-vendor': ['lucide-react', '@iconify/react', '@heroicons/react'],
          'chart-vendor': ['apexcharts'],
          'utility-vendor': ['axios', 'socket.io-client', 'dayjs'],
        },
      },
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Source maps for debugging (disable in production)
    sourcemap: false,
    
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      '@mui/material',
      '@mui/icons-material',
      'lucide-react',
      'dayjs',
      'apexcharts',
      'react-apexcharts'
    ],
    // Force pre-bundling of these deps
    force: false,
  },
  
  // Development server configuration
  server: {
    proxy: {
      // Proxy all /api/* requests to the backend in development
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
    // Enable HMR
    hmr: true,
    // Open browser on server start
    open: false,
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: false,
  },
})
