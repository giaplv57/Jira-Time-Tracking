import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0', // Bind to all network interfaces
    port: 5174,      // Set the port to 5174
    strictPort: true, // Fail if port is already in use
    proxy: {
      // Proxy API requests to Jira server to avoid CORS issues
      '/api/jira': {
        target: 'https://jira.worldquant.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jira/, ''),
        secure: false, // Ignore SSL certificate issues (for development only)
      },
    },
  },
});
