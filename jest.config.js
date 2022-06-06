module.exports = {
  preset: 'ts-jest',
  testEnvironment: '<rootDir>/src/integrations/jest/environment.ts',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/dist/'],
  testRegex: '.*\\.spec\\.ts$',
  testTimeout: 20000,
};
