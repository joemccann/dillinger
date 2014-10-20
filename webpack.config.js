var path = require("path");
var webpack = require("webpack");

var nodeModulesPath = path.join(__dirname, 'node_modules');
// var bowerComponentsPath = path.join(__dirname, 'bower_components');

// var ngAnnotatePlugin = require('ng-annotate-webpack-plugin');

module.exports = {
  cache: true,
  entry: "./public/coffeescript/app.coffee",
  output: {
    path: path.join(__dirname, "public/js")
    // publicPath: "public/",
    // filename: "[name].js",
    // chunkFilename: "[chunkhash].js"
  },
  module: {
    noParse: [
      /brace/,
      /angular/
    ],
    loaders: [
      // required to write "require('./style.css')"
      { test: /\.css$/,         loader: "style-loader!css-loader" },
      { test: /\.handlebars$/,  loader: "handlebars-loader" },
      { test: /\.coffee$/,      loader: "coffee-loader" },
      // export angular
      // { test: /[\/]angular\.js$/, loader: "exports?angular" },

      // required for bootstrap icons
      // { test: /\.woff$/,   loader: "url-loader?prefix=font/&limit=5000&mimetype=application/font-woff" },
      // { test: /\.ttf$/,    loader: "file-loader?prefix=font/" },
      // { test: /\.eot$/,    loader: "file-loader?prefix=font/" },
      // { test: /\.svg$/,    loader: "file-loader?prefix=font/" },
    ]
  },
  resolve: {
    // root: [nodeModulesPath, bowerComponentsPath],
    // alias: {
    //   angular: 'angular/angular',
    //   angularRouter: 'angular-ui-router/release/angular-ui-router'
    // },
    extensions: ["", ".webpack.js", ".web.js", ".coffee", ".handlebars", ".js"]
  },
  resolveLoader: {
      root: nodeModulesPath
  },
  plugins: [
    // new webpack.ContextReplacementPlugin(/.*$/, /a^/),
    new webpack.ProvidePlugin({
      'angular': 'exports?angular!angular'
    })
    // new webpack.ResolverPlugin([
    //   new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
    // ])
  ]
};
