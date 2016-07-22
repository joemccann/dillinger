
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
      /angular/,
      /autoit.js/
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
    modulesDirectories: ['node_modules', 'plugins'],
    extensions: ['', '.webpack.js', '.web.js', '.js'], 
    alias: {
      'angular': 'angular/angular',
      'md': 'core/markdown-it'
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
