/** @type {import('@types/jest').Config.InitialOptions} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ["jest-extended/all"],
  // Adjust these options as needed
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true, isolatedModules: true }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
