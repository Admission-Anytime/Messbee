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
        target: "http://localhost:5002",
        changeOrigin: true,
        secure: false
      },
      "/uploads": {
        target: "http://localhost:5002",
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxNZXNzYmVlXFxcXGNsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcTWVzc2JlZVxcXFxjbGllbnRcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L01lc3NiZWUvY2xpZW50L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCh7XHJcbiAgICAgIC8vIEVuYWJsZSBGYXN0IFJlZnJlc2hcclxuICAgICAgZmFzdFJlZnJlc2g6IHRydWUsXHJcbiAgICAgIC8vIE9wdGltaXplIGJhYmVsIHRyYW5zZm9ybXNcclxuICAgICAgYmFiZWw6IHtcclxuICAgICAgICBwbHVnaW5zOiBbXHJcbiAgICAgICAgICAvLyBBZGQgYmFiZWwgcGx1Z2lucyBpZiBuZWVkZWRcclxuICAgICAgICBdXHJcbiAgICAgIH1cclxuICAgIH0pLFxyXG4gIF0sXHJcbiAgXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgZGVkdXBlOiBbJ2FwZXhjaGFydHMnXVxyXG4gIH0sXHJcbiAgXHJcbiAgLy8gQnVpbGQgb3B0aW1pemF0aW9uc1xyXG4gIGJ1aWxkOiB7XHJcbiAgICAvLyBUYXJnZXQgbW9kZXJuIGJyb3dzZXJzIGZvciBzbWFsbGVyIGJ1bmRsZVxyXG4gICAgdGFyZ2V0OiAnZXNuZXh0JyxcclxuICAgIFxyXG4gICAgLy8gRW5hYmxlIG1pbmlmaWNhdGlvbiB3aXRoIGVzYnVpbGQgKGZhc3RlciB0aGFuIHRlcnNlcilcclxuICAgIG1pbmlmeTogJ2VzYnVpbGQnLFxyXG4gICAgXHJcbiAgICAvLyBlc2J1aWxkIG9wdGlvbnNcclxuICAgIGVzYnVpbGQ6IHtcclxuICAgICAgZHJvcDogWydjb25zb2xlJywgJ2RlYnVnZ2VyJ10sIC8vIFJlbW92ZSBjb25zb2xlLmxvZ3MgYW5kIGRlYnVnZ2VycyBpbiBwcm9kdWN0aW9uXHJcbiAgICB9LFxyXG4gICAgXHJcbiAgICAvLyBPcHRpbWl6ZSBjaHVuayBzcGxpdHRpbmdcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XHJcbiAgICAgICAgICAvLyBTZXBhcmF0ZSB2ZW5kb3IgY2h1bmtzIGZvciBiZXR0ZXIgY2FjaGluZ1xyXG4gICAgICAgICAgJ3JlYWN0LXZlbmRvcic6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcclxuICAgICAgICAgICdtdWktdmVuZG9yJzogWydAbXVpL21hdGVyaWFsJywgJ0BtdWkvaWNvbnMtbWF0ZXJpYWwnLCAnQG11aS94LWNoYXJ0cycsICdAbXVpL3gtZGF0YS1ncmlkJywgJ0BtdWkveC1kYXRlLXBpY2tlcnMnLCAnQGVtb3Rpb24vcmVhY3QnLCAnQGVtb3Rpb24vc3R5bGVkJ10sXHJcbiAgICAgICAgICAnaWNvbi12ZW5kb3InOiBbJ2x1Y2lkZS1yZWFjdCcsICdAaWNvbmlmeS9yZWFjdCcsICdAaGVyb2ljb25zL3JlYWN0J10sXHJcbiAgICAgICAgICAnY2hhcnQtdmVuZG9yJzogWydhcGV4Y2hhcnRzJ10sXHJcbiAgICAgICAgICAndXRpbGl0eS12ZW5kb3InOiBbJ2F4aW9zJywgJ3NvY2tldC5pby1jbGllbnQnLCAnZGF5anMnXSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIFxyXG4gICAgLy8gQ2h1bmsgc2l6ZSB3YXJuaW5nc1xyXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwLFxyXG4gICAgXHJcbiAgICAvLyBTb3VyY2UgbWFwcyBmb3IgZGVidWdnaW5nIChkaXNhYmxlIGluIHByb2R1Y3Rpb24pXHJcbiAgICBzb3VyY2VtYXA6IGZhbHNlLFxyXG4gICAgXHJcbiAgICAvLyBFbmFibGUgQ1NTIGNvZGUgc3BsaXR0aW5nXHJcbiAgICBjc3NDb2RlU3BsaXQ6IHRydWUsXHJcbiAgfSxcclxuICBcclxuICAvLyBPcHRpbWl6ZSBkZXBlbmRlbmNpZXNcclxuICBvcHRpbWl6ZURlcHM6IHtcclxuICAgIGluY2x1ZGU6IFtcclxuICAgICAgJ3JlYWN0JyxcclxuICAgICAgJ3JlYWN0LWRvbScsXHJcbiAgICAgICdyZWFjdC1yb3V0ZXItZG9tJyxcclxuICAgICAgJ2F4aW9zJyxcclxuICAgICAgJ0BtdWkvbWF0ZXJpYWwnLFxyXG4gICAgICAnQG11aS9pY29ucy1tYXRlcmlhbCcsXHJcbiAgICAgICdsdWNpZGUtcmVhY3QnLFxyXG4gICAgICAnZGF5anMnLFxyXG4gICAgICAnYXBleGNoYXJ0cycsXHJcbiAgICAgICdyZWFjdC1hcGV4Y2hhcnRzJ1xyXG4gICAgXSxcclxuICAgIC8vIEZvcmNlIHByZS1idW5kbGluZyBvZiB0aGVzZSBkZXBzXHJcbiAgICBmb3JjZTogZmFsc2UsXHJcbiAgfSxcclxuICBcclxuICAvLyBEZXZlbG9wbWVudCBzZXJ2ZXIgY29uZmlndXJhdGlvblxyXG4gIHNlcnZlcjoge1xyXG4gICAgcHJveHk6IHtcclxuICAgICAgLy8gUHJveHkgYWxsIC9hcGkvKiByZXF1ZXN0cyB0byB0aGUgYmFja2VuZCBpbiBkZXZlbG9wbWVudFxyXG4gICAgICAnL2FwaSc6IHtcclxuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjUwMDInLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICBzZWN1cmU6IGZhbHNlLFxyXG4gICAgICB9LFxyXG4gICAgICAnL3VwbG9hZHMnOiB7XHJcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo1MDAyJyxcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgc2VjdXJlOiBmYWxzZSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICAvLyBFbmFibGUgSE1SXHJcbiAgICBobXI6IHRydWUsXHJcbiAgICAvLyBPcGVuIGJyb3dzZXIgb24gc2VydmVyIHN0YXJ0XHJcbiAgICBvcGVuOiBmYWxzZSxcclxuICB9LFxyXG4gIFxyXG4gIC8vIFByZXZpZXcgc2VydmVyIGNvbmZpZ3VyYXRpb25cclxuICBwcmV2aWV3OiB7XHJcbiAgICBwb3J0OiA0MTczLFxyXG4gICAgc3RyaWN0UG9ydDogZmFsc2UsXHJcbiAgfSxcclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEyTyxTQUFTLG9CQUFvQjtBQUN4USxPQUFPLFdBQVc7QUFHbEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBO0FBQUEsTUFFSixhQUFhO0FBQUE7QUFBQSxNQUViLE9BQU87QUFBQSxRQUNMLFNBQVM7QUFBQTtBQUFBLFFBRVQ7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBRUEsU0FBUztBQUFBLElBQ1AsUUFBUSxDQUFDLFlBQVk7QUFBQSxFQUN2QjtBQUFBO0FBQUEsRUFHQSxPQUFPO0FBQUE7QUFBQSxJQUVMLFFBQVE7QUFBQTtBQUFBLElBR1IsUUFBUTtBQUFBO0FBQUEsSUFHUixTQUFTO0FBQUEsTUFDUCxNQUFNLENBQUMsV0FBVyxVQUFVO0FBQUE7QUFBQSxJQUM5QjtBQUFBO0FBQUEsSUFHQSxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUE7QUFBQSxVQUVaLGdCQUFnQixDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQSxVQUN6RCxjQUFjLENBQUMsaUJBQWlCLHVCQUF1QixpQkFBaUIsb0JBQW9CLHVCQUF1QixrQkFBa0IsaUJBQWlCO0FBQUEsVUFDdEosZUFBZSxDQUFDLGdCQUFnQixrQkFBa0Isa0JBQWtCO0FBQUEsVUFDcEUsZ0JBQWdCLENBQUMsWUFBWTtBQUFBLFVBQzdCLGtCQUFrQixDQUFDLFNBQVMsb0JBQW9CLE9BQU87QUFBQSxRQUN6RDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUdBLHVCQUF1QjtBQUFBO0FBQUEsSUFHdkIsV0FBVztBQUFBO0FBQUEsSUFHWCxjQUFjO0FBQUEsRUFDaEI7QUFBQTtBQUFBLEVBR0EsY0FBYztBQUFBLElBQ1osU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUVBLE9BQU87QUFBQSxFQUNUO0FBQUE7QUFBQSxFQUdBLFFBQVE7QUFBQSxJQUNOLE9BQU87QUFBQTtBQUFBLE1BRUwsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBLFlBQVk7QUFBQSxRQUNWLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFFBQVE7QUFBQSxNQUNWO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSxLQUFLO0FBQUE7QUFBQSxJQUVMLE1BQU07QUFBQSxFQUNSO0FBQUE7QUFBQSxFQUdBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxFQUNkO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
