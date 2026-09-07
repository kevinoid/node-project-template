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
      'import-x/no-extraneous-dependencies': ['error', {
        devDependencies: [
          ...nodejs
            .findLast(
              (conf) => conf.rules?.['import-x/no-extraneous-dependencies'],
            )
            .rules['import-x/no-extraneous-dependencies'][1].devDependencies,
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
      'import-x/no-unused-modules': 'off',

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
      'import-x/no-unused-modules': 'off',

      // Allow null use in tests
      'unicorn/no-null': 'off',

      // Allow `this` outside of classes
      // For Mocha (e.g. this.timeout()) and testing `this` (e.g. in callbacks)
      'unicorn/no-this-outside-of-class': 'off',

      // Allow EventEmitter use in tests
      'unicorn/prefer-event-target': 'off',
    },
  },
];
