import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  envDir: resolve(__dirname, '..'),
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          // Extract React + its small deps to avoid the main vendor chunk crossing 500kB.
          if (
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/react-dom/') ||
            id.includes('/node_modules/scheduler/') ||
            id.includes('/node_modules/use-sync-external-store/') ||
            id.includes('/node_modules/object-assign/') ||
            id.includes('/node_modules/loose-envify/')
          )
            return 'react';

          if (
            id.includes('/node_modules/react-router/') ||
            id.includes('/node_modules/react-router-dom/') ||
            id.includes('/node_modules/@remix-run/router/')
          )
            return 'router';

          if (id.includes('/node_modules/framer-motion/')) return 'motion';
          if (id.includes('/node_modules/recharts/')) return 'charts';
          if (id.includes('/node_modules/socket.io-client/')) return 'socket';
          if (id.includes('/node_modules/axios/')) return 'http';
          if (id.includes('/node_modules/imagekitio-react')) return 'imagekit';
          return 'vendor';
        },
      },
    },
  },
})
