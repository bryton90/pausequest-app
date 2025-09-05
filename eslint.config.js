import ts from '@typescript-eslint/eslint-plugin'
import { defineConfig } from 'eslint/config';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default defineConfig([
  {
    files: ['**/*.{ts,tsx}'],
    parser: tsParser,
    plugins: [ts],
    extends: ['plugin:@typescript-eslint/recommended'],
  },
]);
