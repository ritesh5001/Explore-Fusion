const { resolve } = require('path');

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/tests/**/*.test.[jt]s?(x)'],
  setupFilesAfterEnv: [resolve(__dirname, 'tests/setup.js')],
  globalSetup: resolve(__dirname, 'tests/jestGlobalSetup.js'),
  globalTeardown: resolve(__dirname, 'tests/jestGlobalTeardown.js'),
  testTimeout: 20000,
};
