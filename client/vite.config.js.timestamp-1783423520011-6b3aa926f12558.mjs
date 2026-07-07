// vite.config.js
import { defineConfig } from "file:///D:/Messbee/client/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Messbee/client/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
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
    dedupe: ["apexcharts"]
  },
  // Build optimizations
  build: {
    // Target modern browsers for smaller bundle
    target: "esnext",
    // Enable minification with esbuild (faster than terser)
    minify: "esbuild",
    // esbuild options
    esbuild: {
      drop: ["console", "debugger"]
      // Remove console.logs and debuggers in production
    },
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "mui-vendor": ["@mui/material", "@mui/icons-material", "@mui/x-charts", "@mui/x-data-grid", "@mui/x-date-pickers", "@emotion/react", "@emotion/styled"],
          "icon-vendor": ["lucide-react", "@iconify/react", "@heroicons/react"],
          "chart-vendor": ["apexcharts"],
          "utility-vendor": ["axios", "socket.io-client", "dayjs"]
        }
      }
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1e3,
    // Source maps for debugging (disable in production)
    sourcemap: false,
    // Enable CSS code splitting
    cssCodeSplit: true
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "axios",
      "@mui/material",
      "@mui/icons-material",
      "lucide-react",
      "dayjs",
      "apexcharts",
      "react-apexcharts"
    ],
    // Force pre-bundling of these deps
    force: false
  },
  // Development server configuration
  server: {
    proxy: {
      // Proxy all /api/* requests to the backend in development
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false
      }
    },
    // Enable HMR
    hmr: true,
    // Open browser on server start
    open: false
  },
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: false
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxNZXNzYmVlXFxcXGNsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcTWVzc2JlZVxcXFxjbGllbnRcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L01lc3NiZWUvY2xpZW50L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCh7XHJcbiAgICAgIC8vIEVuYWJsZSBGYXN0IFJlZnJlc2hcclxuICAgICAgZmFzdFJlZnJlc2g6IHRydWUsXHJcbiAgICAgIC8vIE9wdGltaXplIGJhYmVsIHRyYW5zZm9ybXNcclxuICAgICAgYmFiZWw6IHtcclxuICAgICAgICBwbHVnaW5zOiBbXHJcbiAgICAgICAgICAvLyBBZGQgYmFiZWwgcGx1Z2lucyBpZiBuZWVkZWRcclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgXSxcclxuICBcclxuICByZXNvbHZlOiB7XHJcbiAgICBkZWR1cGU6IFsnYXBleGNoYXJ0cyddXHJcbiAgfSxcclxuICBcclxuICAvLyBCdWlsZCBvcHRpbWl6YXRpb25zXHJcbiAgYnVpbGQ6IHtcclxuICAgIC8vIFRhcmdldCBtb2Rlcm4gYnJvd3NlcnMgZm9yIHNtYWxsZXIgYnVuZGxlXHJcbiAgICB0YXJnZXQ6ICdlc25leHQnLFxyXG4gICAgXHJcbiAgICAvLyBFbmFibGUgbWluaWZpY2F0aW9uIHdpdGggZXNidWlsZCAoZmFzdGVyIHRoYW4gdGVyc2VyKVxyXG4gICAgbWluaWZ5OiAnZXNidWlsZCcsXHJcbiAgICBcclxuICAgIC8vIGVzYnVpbGQgb3B0aW9uc1xyXG4gICAgZXNidWlsZDoge1xyXG4gICAgICBkcm9wOiBbJ2NvbnNvbGUnLCAnZGVidWdnZXInXSwgLy8gUmVtb3ZlIGNvbnNvbGUubG9ncyBhbmQgZGVidWdnZXJzIGluIHByb2R1Y3Rpb25cclxuICAgIH0sXHJcbiAgICBcclxuICAgIC8vIE9wdGltaXplIGNodW5rIHNwbGl0dGluZ1xyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBtYW51YWxDaHVua3M6IHtcclxuICAgICAgICAgIC8vIFNlcGFyYXRlIHZlbmRvciBjaHVua3MgZm9yIGJldHRlciBjYWNoaW5nXHJcbiAgICAgICAgICAncmVhY3QtdmVuZG9yJzogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVhY3Qtcm91dGVyLWRvbSddLFxyXG4gICAgICAgICAgJ211aS12ZW5kb3InOiBbJ0BtdWkvbWF0ZXJpYWwnLCAnQG11aS9pY29ucy1tYXRlcmlhbCcsICdAbXVpL3gtY2hhcnRzJywgJ0BtdWkveC1kYXRhLWdyaWQnLCAnQG11aS94LWRhdGUtcGlja2VycycsICdAZW1vdGlvbi9yZWFjdCcsICdAZW1vdGlvbi9zdHlsZWQnXSxcclxuICAgICAgICAgICdpY29uLXZlbmRvcic6IFsnbHVjaWRlLXJlYWN0JywgJ0BpY29uaWZ5L3JlYWN0JywgJ0BoZXJvaWNvbnMvcmVhY3QnXSxcclxuICAgICAgICAgICdjaGFydC12ZW5kb3InOiBbJ2FwZXhjaGFydHMnXSxcclxuICAgICAgICAgICd1dGlsaXR5LXZlbmRvcic6IFsnYXhpb3MnLCAnc29ja2V0LmlvLWNsaWVudCcsICdkYXlqcyddLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICAvLyBDaHVuayBzaXplIHdhcm5pbmdzXHJcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXHJcbiAgICBcclxuICAgIC8vIFNvdXJjZSBtYXBzIGZvciBkZWJ1Z2dpbmcgKGRpc2FibGUgaW4gcHJvZHVjdGlvbilcclxuICAgIHNvdXJjZW1hcDogZmFsc2UsXHJcbiAgICBcclxuICAgIC8vIEVuYWJsZSBDU1MgY29kZSBzcGxpdHRpbmdcclxuICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcclxuICB9LFxyXG4gIFxyXG4gIC8vIE9wdGltaXplIGRlcGVuZGVuY2llc1xyXG4gIG9wdGltaXplRGVwczoge1xyXG4gICAgaW5jbHVkZTogW1xyXG4gICAgICAncmVhY3QnLFxyXG4gICAgICAncmVhY3QtZG9tJyxcclxuICAgICAgJ3JlYWN0LXJvdXRlci1kb20nLFxyXG4gICAgICAnYXhpb3MnLFxyXG4gICAgICAnQG11aS9tYXRlcmlhbCcsXHJcbiAgICAgICdAbXVpL2ljb25zLW1hdGVyaWFsJyxcclxuICAgICAgJ2x1Y2lkZS1yZWFjdCcsXHJcbiAgICAgICdkYXlqcycsXHJcbiAgICAgICdhcGV4Y2hhcnRzJyxcclxuICAgICAgJ3JlYWN0LWFwZXhjaGFydHMnXHJcbiAgICBdLFxyXG4gICAgLy8gRm9yY2UgcHJlLWJ1bmRsaW5nIG9mIHRoZXNlIGRlcHNcclxuICAgIGZvcmNlOiBmYWxzZSxcclxuICB9LFxyXG4gIFxyXG4gIC8vIERldmVsb3BtZW50IHNlcnZlciBjb25maWd1cmF0aW9uXHJcbiAgc2VydmVyOiB7XHJcbiAgICBwcm94eToge1xyXG4gICAgICAvLyBQcm94eSBhbGwgL2FwaS8qIHJlcXVlc3RzIHRvIHRoZSBiYWNrZW5kIGluIGRldmVsb3BtZW50XHJcbiAgICAgICcvYXBpJzoge1xyXG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMCcsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXHJcbiAgICAgIH0sXHJcbiAgICAgICcvdXBsb2Fkcyc6IHtcclxuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjUwMDAnLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICBzZWN1cmU6IGZhbHNlLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIC8vIEVuYWJsZSBITVJcclxuICAgIGhtcjogdHJ1ZSxcclxuICAgIC8vIE9wZW4gYnJvd3NlciBvbiBzZXJ2ZXIgc3RhcnRcclxuICAgIG9wZW46IGZhbHNlLFxyXG4gIH0sXHJcbiAgXHJcbiAgLy8gUHJldmlldyBzZXJ2ZXIgY29uZmlndXJhdGlvblxyXG4gIHByZXZpZXc6IHtcclxuICAgIHBvcnQ6IDQxNzMsXHJcbiAgICBzdHJpY3RQb3J0OiBmYWxzZSxcclxuICB9LFxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTJPLFNBQVMsb0JBQW9CO0FBQ3hRLE9BQU8sV0FBVztBQUdsQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUE7QUFBQSxNQUVKLGFBQWE7QUFBQTtBQUFBLE1BRWIsT0FBTztBQUFBLFFBQ0wsU0FBUztBQUFBO0FBQUEsUUFFVDtBQUFBLE1BQ0Y7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFFQSxTQUFTO0FBQUEsSUFDUCxRQUFRLENBQUMsWUFBWTtBQUFBLEVBQ3ZCO0FBQUE7QUFBQSxFQUdBLE9BQU87QUFBQTtBQUFBLElBRUwsUUFBUTtBQUFBO0FBQUEsSUFHUixRQUFRO0FBQUE7QUFBQSxJQUdSLFNBQVM7QUFBQSxNQUNQLE1BQU0sQ0FBQyxXQUFXLFVBQVU7QUFBQTtBQUFBLElBQzlCO0FBQUE7QUFBQSxJQUdBLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQTtBQUFBLFVBRVosZ0JBQWdCLENBQUMsU0FBUyxhQUFhLGtCQUFrQjtBQUFBLFVBQ3pELGNBQWMsQ0FBQyxpQkFBaUIsdUJBQXVCLGlCQUFpQixvQkFBb0IsdUJBQXVCLGtCQUFrQixpQkFBaUI7QUFBQSxVQUN0SixlQUFlLENBQUMsZ0JBQWdCLGtCQUFrQixrQkFBa0I7QUFBQSxVQUNwRSxnQkFBZ0IsQ0FBQyxZQUFZO0FBQUEsVUFDN0Isa0JBQWtCLENBQUMsU0FBUyxvQkFBb0IsT0FBTztBQUFBLFFBQ3pEO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBR0EsdUJBQXVCO0FBQUE7QUFBQSxJQUd2QixXQUFXO0FBQUE7QUFBQSxJQUdYLGNBQWM7QUFBQSxFQUNoQjtBQUFBO0FBQUEsRUFHQSxjQUFjO0FBQUEsSUFDWixTQUFTO0FBQUEsTUFDUDtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBRUEsT0FBTztBQUFBLEVBQ1Q7QUFBQTtBQUFBLEVBR0EsUUFBUTtBQUFBLElBQ04sT0FBTztBQUFBO0FBQUEsTUFFTCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxRQUFRO0FBQUEsTUFDVjtBQUFBLE1BQ0EsWUFBWTtBQUFBLFFBQ1YsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsUUFBUTtBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUVBLEtBQUs7QUFBQTtBQUFBLElBRUwsTUFBTTtBQUFBLEVBQ1I7QUFBQTtBQUFBLEVBR0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLEVBQ2Q7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
