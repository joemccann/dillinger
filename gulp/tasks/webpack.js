
var bundleLogger, gulp, gulpif, gutil, handleErrors, ngAnnotatePlugin, webpack, webpackConfig, webpackDevServer;

gulp = require("gulp");

gulpif = require("gulp-if");

gutil = require("gulp-util");

webpack = require("webpack");

webpackDevServer = require("webpack-dev-server");

webpackConfig = require("../../webpack.config");

bundleLogger = require("../util/bundleLogger");

handleErrors = require("../util/handleErrors");

ngAnnotatePlugin = require('ng-annotate-webpack-plugin');

gulp.task("webpack:dev", function(cb) {
  var devCompiler, webpackDevConfig;
  webpackDevConfig = Object.create(webpackConfig);
  webpackDevConfig.devtool = "eval";
  webpackDevConfig.debug = true;
  devCompiler = webpack(webpackDevConfig);
  return new webpackDevServer(devCompiler, {
    contentBase: "http://localhost:8080/",
    publicPath: "http://localhost:8090/assets/",
    hot: false,
    stats: {
      colors: true
    }
  }).listen(8090, "localhost", function(err) {
    if (err) {
      throw new gutil.PluginError("webpack:dev", err);
    }
    return cb();
  });
});

gulp.task("webpack:build", function(cb) {
  var webpackProductionConfig;
  webpackProductionConfig = Object.create(webpackConfig);
  webpackProductionConfig.plugins = webpackProductionConfig.plugins.concat(new webpack.DefinePlugin({
    "process.env": {
      "NODE_ENV": JSON.stringify("production")
    }
  }), new webpack.optimize.DedupePlugin(), new ngAnnotatePlugin({
    add: true
  }), new webpack.optimize.UglifyJsPlugin());
  return webpack(webpackProductionConfig, function(err, stats) {
    if (err) {
      throw new gutil.PluginError("webpack:dev", err);
    }
    gutil.log("[webpack:build]", stats.toString({
      colors: true
    }));
    return cb();
  });
});
