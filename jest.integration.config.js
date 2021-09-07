const sharedConfig = require('./jest.config.js')

module.exports = {
  ...sharedConfig,
  testRegex: '\\.int\\.(ts|tsx|js)$',
}
