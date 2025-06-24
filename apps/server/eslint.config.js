import { nestJsConfig } from '@repo/eslint-config/nest';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nestJsConfig,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
    },
  },
];
