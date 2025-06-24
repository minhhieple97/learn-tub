import { config as baseConfig } from './base.js';
import globals from 'globals';

/**
 * A custom ESLint configuration for library packages.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const libraryConfig = [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        React: true,
        JSX: true,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
  },
  {
    ignores: ['.*.js', 'node_modules/', 'dist/'],
  },
];
