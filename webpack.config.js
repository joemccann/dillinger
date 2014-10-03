var path = require("path");
// var webpack = require("webpack");

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
    /brace/
    ],
    loaders: [
      // required to write "require('./style.css')"
      // { test: /\.css$/,    loader: "style-loader!css-loader" },
      { test: /\.coffee$/,    loader: "coffee-loader" }

      // required for bootstrap icons
      // { test: /\.woff$/,   loader: "url-loader?prefix=font/&limit=5000&mimetype=application/font-woff" },
      // { test: /\.ttf$/,    loader: "file-loader?prefix=font/" },
      // { test: /\.eot$/,    loader: "file-loader?prefix=font/" },
      // { test: /\.svg$/,    loader: "file-loader?prefix=font/" },
    ]
  },
  resolve: {
    extensions: ["", ".webpack.js", ".web.js", ".coffee", ".ejs", ".js"]
  }
};
