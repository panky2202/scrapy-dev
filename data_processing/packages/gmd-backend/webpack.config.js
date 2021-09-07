const path = require('path')

module.exports = {
  target: 'node',
  entry: {
    ['graphql']: path.resolve(__dirname, 'graphql/graphql.ts'),
    ['reporting']: path.resolve(__dirname, 'reporting/reporting.ts'),
    ['vendor-images-pipeline']: path.resolve(__dirname, 'vendor-images-pipeline/vendor-images-pipeline.ts'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name]/[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs',
  },
  externals: ['bufferutil', 'utf-8-validate', { sharp: 'commonjs sharp' }],
  optimization: {
    minimize: false,
  },
}
