import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Build output and generated bundles are never linted. `dist-ssr` holds the
  // prerender bundle and must be listed explicitly — it is a sibling of
  // `dist`, not a child, so the `dist` entry does not cover it.
  { ignores: ['dist', 'dist-ssr'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Vite Fast Refresh requires modules to only export components; allow
      // constant exports (e.g. shared class-name strings) alongside them.
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
);
