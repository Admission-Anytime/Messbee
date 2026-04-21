import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const getBackendOrigin = (apiUrl) => {
  if (!apiUrl) return 'http://localhost:5001'
  return apiUrl.replace(/\/api\/?$/, '')
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendOrigin = getBackendOrigin(env.VITE_API_URL)

  return {
    plugins: [
      react({
        // Enable Fast Refresh
        fastRefresh: true,
        // Optimize babel transforms
        babel: {
          plugins: [
            // Add babel plugins if needed
          ]
        },
      })
    ],
    
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
      ],
      // Force pre-bundling of these deps
      force: false,
    },
    
    // Development server configuration
    server: {
      proxy: {
        // Proxy API requests to the backend in development.
        '/api': {
          target: backendOrigin,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: backendOrigin,
          changeOrigin: true,
          secure: false,
        },
        '/socket.io': {
          target: backendOrigin,
          changeOrigin: true,
          secure: false,
          ws: true,
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
  }
})
