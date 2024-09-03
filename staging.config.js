import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig(() => {
  return {
    build: {
      outDir: 'build',
      rollupOptions: {
        external: ['bumblebee-hotword'], // Mark the module as external
      },
    },
    plugins: [react()],
    define: {
      global: {}
    },
  };
});