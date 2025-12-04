import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    dts({
      insertTypesEntry: true,
      exclude: ['**/*.test.*', '**/*.spec.*'],
      bundleDeclaration: true,
    }),
  ],
  server: {
    watch: {
      ignored: ['**/example/**'],
    },
  },
  resolve: {
    alias: {
      '@react-email-dnd/shared': resolve(__dirname, '../shared/src'),
      '@react-email-dnd/renderer': resolve(__dirname, '../renderer/src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.mjs' : 'index.cjs'),
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-dom/client',
        '@react-email-dnd/renderer',
        '@react-email-dnd/shared',
        '@dnd-kit/core',
        '@dnd-kit/sortable',
        '@dnd-kit/utilities',
        '@dnd-kit/modifiers',
        '@phosphor-icons/react',
        'clsx',
        'ramda',
        '@react-email/components',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'styles.css';
          }
          return assetInfo.name || 'asset';
        },
      },
    },
    sourcemap: true,
    minify: false,
    cssCodeSplit: false,
  },
  css: {
    postcss: './postcss.config.js',
  },
});
