/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
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
