const path = require('path')
const webpack = require('webpack')
const NGAnnotatePlugin = require('ng-annotate-webpack-plugin')

module.exports = {
  mode: 'production',
  cache: true,
  entry: path.resolve(__dirname, './public/js/app.js'),
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, './public/dist/')
  },
  resolveLoader: {
    moduleExtensions: ['-loader']
  },
  module: {
    noParse: (content) => /jquery|brace|angular|katek|autoit.js/.test(content),
    rules: [
      {
        test: /\.md$/i, // for importing the README.md
        use: 'raw-loader'
      },
      {
        test: /\.html$/i,
        loader: 'html-loader'
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-env'], compact: false }
        }
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader' // creates style nodes from JS strings
          },
          {
            loader: 'css-loader' // translates CSS into CommonJS
          },
          {
            loader: 'sass-loader' // compiles Sass to CSS
          }
        ]
      }
    ]
  },
  resolve: {
    modules: ['node_modules', 'plugins'],
    alias: {
      angular: 'angular/angular',
      md: 'core/markdown-it'
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      angular: 'exports-loader?angular!angular'
    }),
    new webpack.LoaderOptionsPlugin({
      debug: true
    }),
    new NGAnnotatePlugin({
      add: true
    })
  ]
}
