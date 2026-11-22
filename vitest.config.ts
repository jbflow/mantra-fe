/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    exclude: ['node_modules', 'legacy-react', '.next/**'],
    coverage: {
      provider: 'istanbul',         
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        '**/*.test.*',
        'tests/**',
        'node_modules/**',
        '.next/**'
      ],
    },
  },
});
