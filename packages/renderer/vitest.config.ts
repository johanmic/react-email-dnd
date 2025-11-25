import { defineConfig, configDefaults } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      reporter: ['text', 'lcov'],
    },
    exclude: [...configDefaults.exclude, '**/example/**'],
  },
  resolve: {
    alias: {
      '@react-email-dnd/shared': resolve(__dirname, '../shared/src'),
    },
  },
});