module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@corridor/domain$': '<rootDir>/../../packages/domain/src/index.ts',
    '^@corridor/mocks$': '<rootDir>/../../packages/mocks/src/index.ts',
  },
};
