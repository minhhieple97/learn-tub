import { nextJsConfig } from '@repo/eslint-config/next-js';

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    rules: {
      'react/prop-types': 'off', // TypeScript handles prop validation
      'react/no-unknown-property': ['error', { ignore: ['data-cmdk-input-wrapper'] }],
    },
  },
];
