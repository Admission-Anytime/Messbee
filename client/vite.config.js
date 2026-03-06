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
  
  // Build optimizations
  build: {
    // Target modern browsers for smaller bundle
    target: 'esnext',
    
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
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
