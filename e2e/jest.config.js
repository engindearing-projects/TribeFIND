/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  maxConcurrency: 1,
  testEnvironment: './environment.js',
  testRunner: 'jest-circus/runner',
  testMatch: ['<rootDir>/e2e/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/init.js'],
  verbose: true,
};
