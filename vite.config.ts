import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Remove proxy configuration for StackBlitz compatibility
    // The app will use mock backend services instead
  },
  define: {
    // Ensure environment variables are available
    'process.env': process.env
  }
});