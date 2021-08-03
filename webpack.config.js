const path = require('path')
const SentryWebpackPlugin = require('@sentry/webpack-plugin')
const pkg = require('./package.json')

const mode = process.env.ENVIRONMENT || 'production'

module.exports = {
  target: 'webworker',
  output: {
    filename: 'worker.js',
    path: path.join(__dirname, 'dist')
  },
  mode,
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true
        }
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      }
    ]
  },
  node: {
    fs: 'empty'
  },
  performance: {
    hints: false
  },
  optimization: {
    usedExports: true
  },
  plugins: [
    new SentryWebpackPlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: 'mugtungshing',
      project: 'telegram-bot',
      release: `${pkg.name}-${pkg.version}`,
      include: './dist',
      urlPrefix: '/'
    })
  ]
}
