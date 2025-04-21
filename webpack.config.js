'use strict'

const path = require('path')
const webpack = require('webpack')

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  cache: true,
  entry: {
    app: './public/js/app.js'
  },
  output: {
    path: path.join(__dirname, 'public/dist'),
    filename: '[name].js',
    publicPath: '/'
  },
  module: {
    noParse: [
      /brace/,
      /angular/,
      /autoit.js/
    ],
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  resolveLoader: {
    moduleExtensions: ['-loader']
  },
  optimization: {
    minimize: false
  },
  resolve: {
    modules: ['node_modules', 'plugins'],
    extensions: ['.js'],
    alias: {
      angular: 'angular/angular',
      md: 'core/markdown-it',
      ace: 'brace'
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      angular: 'exports-loader?angular!angular',
      ace: ['brace', 'ace']
    }),
    new webpack.LoaderOptionsPlugin({
      debug: true
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
      }
    })
  ]
}
