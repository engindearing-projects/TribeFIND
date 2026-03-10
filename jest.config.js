const expoPreset = require('jest-expo/jest-preset');

module.exports = {
  ...expoPreset,
  setupFiles: [...(expoPreset.setupFiles || []), './jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|@reduxjs/toolkit|react-redux|@supabase/.*)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    ...expoPreset.moduleNameMapper,
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/', '<rootDir>/__tests__/helpers/renderWithProviders.tsx', '<rootDir>/src/examples/'],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/android/**',
    '!**/ios/**',
    '!**/coverage/**',
    '!babel.config.js',
    '!jest.config.js',
    '!app.config.js',
  ],
};
