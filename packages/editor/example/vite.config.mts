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
      '@react-email-dnd/styles.css': toRoot('../dist/styles.css'),
      '@react-email-dnd/shared': toRoot('../../shared/src'),
      '@react-email-dnd/renderer': toRoot('../../renderer/src'),
      '@react-email-dnd': toRoot('../src/index.ts'),
      '@react-email-dnd/editor': toRoot('../src/index.ts'),
      'react-email-dnd': toRoot('../src/index.ts'),
      '@react-email/components': toRoot('node_modules/@react-email/components'),
    },
  },
  optimizeDeps: {
    exclude: [
      '@react-email-dnd',
      '@react-email-dnd/editor',
      'react-email-dnd',
      '@react-email-dnd/shared',
      '@react-email-dnd/renderer',
    ],
  },
  server: {
    fs: {
      allow: [
        toRoot('..'),
        toRoot('../../shared/src'),
        toRoot('../../renderer/src'),
      ],
    },
  },
});
