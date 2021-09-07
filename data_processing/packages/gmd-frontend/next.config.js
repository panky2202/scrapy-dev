const withTM = require('next-transpile-modules')([
  '@engaging-enterprises/gmd/src/azureGMDFrontend',
  '@engaging-enterprises/basic-utils',
  'use-sound',
])
const cfg = withTM()

module.exports = {
  ...cfg,
  trailingSlash: true,
  webpack: (config, options) => {
    cfg.webpack(config, options)

    const isServer = options.isServer
    config.module.rules.push({
      test: /\.(bin)$/i,
      use: [
        {
          loader: 'file-loader',
          options: {
            publicPath: '/_next/static/',
            outputPath: `${isServer ? '../' : ''}static/`,
            name: '[name].[ext]',
          },
        },
      ],
    })

    config.module.rules.push({
      test: /\.(mp3)$/,
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/sounds/',
          outputPath: 'static/sounds/',
          name: '[name].[ext]',
          esModule: false,
        },
      },
    })

    return config
  },
}
