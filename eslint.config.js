const config = require('@rubensworks/eslint-config');

module.exports = config([
  {
    files: [ '**/*.ts' ],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: [ './tsconfig.eslint.json' ],
      },
    },
  },
  {
    rules: {
      'no-implicit-coercion': 'off',
    },
  },
  {
    // The previous .eslintrc setup linted only TypeScript (`eslint . --ext .ts`).
    // Flat config drops `--ext`, so restrict the scope here to keep it unchanged.
    ignores: [
      'node_modules/',
      'coverage/',
      '**/*.js',
      '**/*.d.ts',
      '**/*.js.map',
      '**/*.md',
      '**/*.json',
      '**/*.jsonc',
      '**/*.yml',
      '**/*.yaml',
      '.github/',
    ],
  },
]);
