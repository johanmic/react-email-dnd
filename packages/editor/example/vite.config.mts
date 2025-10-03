import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const toRoot = (path: string) => resolve(__dirname, path);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      react: toRoot('node_modules/react'),
      'react-dom': toRoot('node_modules/react-dom'),
      'react-email-dnd/styles.css': toRoot('../dist/styles.css'),
      'react-email-dnd': toRoot('../dist'),
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
