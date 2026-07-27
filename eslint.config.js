const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'expo-env.d.ts'],
  },
  {
    files: ['jest.setup.ts', 'jest.flashlist.js', 'src/**/*.test.{ts,tsx}'],
    languageOptions: {
      globals: {
        afterAll: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        describe: 'readonly',
        expect: 'readonly',
        it: 'readonly',
        jest: 'readonly',
        test: 'readonly',
      },
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/features/auth',
              from: './src/features/games',
              message:
                'Una feature no puede importar internals de otra. Extrae lo compartido a src/shared.',
            },
            {
              target: './src/features/games',
              from: './src/features/auth',
              message:
                'Una feature no puede importar internals de otra. Extrae lo compartido a src/shared.',
            },
            {
              target: './src/shared',
              from: './src/features',
              message:
                'src/shared es transversal y no puede depender de una feature: invertiria la direccion de dependencias.',
            },
          ],
        },
      ],
    },
  },
]);
