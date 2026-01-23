import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: './frontend',
  build: {
    outDir: '../public',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        main: './frontend/index.html',
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
