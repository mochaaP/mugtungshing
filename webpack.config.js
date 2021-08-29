const path = require('path')
const webpack = require('webpack')
const { ESBuildMinifyPlugin } = require('esbuild-loader')

const mode = process.env.ENVIRONMENT?.toLowerCase() || process.env.NODE_ENV?.toLowerCase() || 'production'

module.exports = {
  entry: './src/index.ts',
  target: 'webworker',
  output: {
    filename: 'index.js',
    path: path.join(__dirname, 'dist')
  },
  mode,
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: 'esbuild-loader',
        options: {
          loader: 'ts',
          target: 'es2019'
        }
      },
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false
        }
      }
    ]
  },
  resolve: {
    fallback: {
      stream: require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      url: require.resolve('./polyfill/url'),
      path: require.resolve('path-browserify'),
      util: require.resolve('util/'),
      crypto: require.resolve('crypto-browserify'),
      buffer: require.resolve('buffer/'),
      fs: false
    },
    extensions: ['.ts', '.js']
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: [require.resolve('buffer/'), 'Buffer'],
      process: require.resolve('process/browser')
    })
  ],
  optimization: {
    minimizer: mode === 'production' ? [
      new ESBuildMinifyPlugin({
        target: 'es2019'
      })
    ] : undefined
  },
  performance: {
    hints: false
  }
}
