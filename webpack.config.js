
'use strict';

var
  path            = require('path'),
  webpack         = require('webpack'),
  nodeModulesPath = path.join(__dirname, 'node_modules');

module.exports = {
  cache: true,
  entry: './public/js/app.js',
  output: {
    path: path.join(__dirname, 'public/js')
  },
  module: {
    noParse: [
      /brace/,
      /angular/
    ],
    loaders: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },
  resolve: {
    modulesDirectories: ['node_modules'],
    extensions: ['', '.webpack.js', '.web.js', '.js', '.json'], 
    alias: {
      'angular': 'angular/angular'
    }
  },
  resolveLoader: {
    root: nodeModulesPath
  },
  plugins: [
    new webpack.ProvidePlugin({
      'angular': 'exports?angular!angular'
    })
  ]
};
