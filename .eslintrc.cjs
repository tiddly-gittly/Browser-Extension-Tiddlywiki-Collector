module.exports = {
  env: {
    es2020: true,
    browser: true,
  },
  extends: [
    'eslint:recommended',
    'tidgi',
  ],
  settings: {
    react: {
      version: '18.2.0',
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
    ecmaFeatures: { jsx: true },
    project: './tsconfig.eslint.json',
  },
  plugins: [],
  rules: {
    '@typescript-eslint/require-await': 'off',
    'unicorn/no-null': 'off',
  },
  overrides: [
    {
      files: ['.*rc.js', '.*rc.cjs', '*.config.js', '*.config.cjs'],
      env: {
        node: true,
      },
    },
  ],
  ignorePatterns: ['dist/**', 'dist-firefox-v2'],
};
