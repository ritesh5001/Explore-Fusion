const { resolve } = require('path');

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/tests/**/*.test.[jt]s?(x)'],
  setupFilesAfterEnv: [resolve(__dirname, 'tests/setup.js')],
  testTimeout: 20000,
};
