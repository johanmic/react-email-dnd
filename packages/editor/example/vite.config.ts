import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url));
const toRoot = (path: string) => resolve(rootDir, path);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: toRoot('node_modules/react'),
      'react-dom': toRoot('node_modules/react-dom'),
      'react-email-dnd/styles.css': toRoot('../src/styles.css'),
      'react-email-dnd': toRoot('../src'),
      '@react-email/components': toRoot('node_modules/@react-email/components'),
    },
  },
  optimizeDeps: {
    exclude: ['react-email-dnd'],
  },
  server: {
    fs: {
      allow: [toRoot('..')],
    },
  },
});
