// ESLint configuration <https://eslint.org/docs/user-guide/configuring>
import nodejs from '@kevinoid/eslint-config/nodejs.js';
import globals from 'globals';

export default [
  {
    ignores: [
      'coverage/',
      'doc/',
    ],
  },

  ...nodejs,

  {
    rules: {
      // Allow requiring devDependencies for build and test
      'import/no-extraneous-dependencies': ['error', {
        devDependencies: [
          ...nodejs
            .findLast(
              (conf) => conf.rules?.['import/no-extraneous-dependencies'],
            )
            .rules['import/no-extraneous-dependencies'][1].devDependencies,
          'gulpfile.js',
          'test-bin/**',
          'test-lib/**',
          'test/**',
        ],
      }],
    },
  },

  {
    name: 'bin config',
    basePath: 'bin',
    rules: {
      // Executable scripts are not expected to have exports
      'import/no-unused-modules': 'off',

      // Executable scripts should have a shebang
      'n/hashbang': 'off',
    },
  },

  {
    name: 'test config',
    basePath: 'test',
    languageOptions: {
      globals: globals.mocha,
    },
    rules: {
      // Allow, but don't require, braces around function body
      // Braces around body of it() function is more consistent/readable
      'arrow-body-style': 'off',

      // Tests are not expected to have exports
      'import/no-unused-modules': 'off',

      // Allow null use in tests
      'unicorn/no-null': 'off',

      // Allow EventEmitter use in tests
      'unicorn/prefer-event-target': 'off',
    },
  },
];
