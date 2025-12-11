import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Add this to fix the JSX runtime issue
const emotionReact = require('@emotion/react');

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['@emotion/react', '@emotion/styled'],
  },
})
