module.exports = {
  maxWorkers: 4,
  verbose: true,
  rootDir: './data_processing/packages',
  setupFiles: ['../../jest/setup.js'],
  setupFilesAfterEnv: ['../../jest/jestAfterEnvSetup.js', '../../jest-setup.ts'],
  testEnvironment: 'jsdom',
  testRegex: '\\.(test|spec)\\.(ts|tsx|js)$',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|@react-native-picker|@hookform|@react-native-cookies/cookies)',
  ],
  moduleNameMapper: {
    '\\.svg': '<rootDir>/../../jest/svgMock.js',
    '^.+.(css|styl|less|sass|scss|jpg|ttf|woff|woff2|mp3)$':
      'jest-transform-stub',
  },
  cacheDirectory: '../jest/.cache',

  // run tests, defined in order-list-backend/src
  // and not in dist/src…
  modulePathIgnorePatterns: ['order-list-backend/dist/src', 'dist/'],
}
