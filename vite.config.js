import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';


export default defineConfig(() => {
  return {
    build: {
      outDir: 'build',
    },
    plugins: [react()],
    define: {
      global: {}
    },
    server: {
      https: {
        key: fs.readFileSync(path.resolve(__dirname, './localhost-key.pem')),
        cert: fs.readFileSync(path.resolve(__dirname, './localhost.pem')),
      },
      port: 3003,
      host: '0.0.0.0',
    },
  };
});