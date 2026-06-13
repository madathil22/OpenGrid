/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react/react-in-jsx-scope': 'off',
  },
  overrides: [
    {
      // Type-aware linting only for the published library source, where the
      // extra rules add value and a tsconfig project is available.
      files: ['packages/*/src/**/*.{ts,tsx}'],
      extends: ['plugin:@typescript-eslint/recommended-type-checked'],
      parserOptions: {
        project: ['./packages/*/tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
    },
  ],
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'build/',
    '.docusaurus/',
    '*.config.*',
    '*.cjs',
  ],
};
