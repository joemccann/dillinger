
# webpack task
#   ---------------
#   Bundle javascripty things with webpack!
#
#   If the watch task is running, this uses watchify instead
#   of webpack for faster bundling using caching.
#
#
#

gulp             = require("gulp")
gulpif           = require("gulp-if")
gutil            = require("gulp-util")
webpack          = require("webpack")
webpackDevServer = require("webpack-dev-server")
webpackConfig    = require("../../webpack.config")
bundleLogger     = require("../util/bundleLogger")
handleErrors     = require("../util/handleErrors")

ngAnnotatePlugin = require('ng-annotate-webpack-plugin')

gulp.task "webpack:dev", (cb) ->

  webpackDevConfig         = Object.create(webpackConfig)
  webpackDevConfig.devtool = "eval"
  webpackDevConfig.debug   = true

  devCompiler = webpack(webpackDevConfig)

  new webpackDevServer(devCompiler,
    contentBase: "http://localhost:8080/"
    publicPath: "http://localhost:8090/assets/"
    hot: false
    stats:
      colors: true
  ).listen( 8090, "localhost", (err) ->
    if err then throw new gutil.PluginError("webpack:dev", err)
    cb()
  )
  # devCompiler.run (err, stats) ->
  #   if err then throw new gutil.PluginError("webpack:dev", err)
  #   cb()

gulp.task "webpack:build", (cb) ->

  webpackProductionConfig = Object.create(webpackConfig)

  webpackProductionConfig.plugins = webpackProductionConfig.plugins.concat(
    new webpack.DefinePlugin(
      "process.env":
        "NODE_ENV": JSON.stringify("production")
    ),
      new webpack.optimize.DedupePlugin()
    new ngAnnotatePlugin
      add: true
    new webpack.optimize.UglifyJsPlugin()
  )

  webpack(webpackProductionConfig, (err, stats) ->
    if err then throw new gutil.PluginError("webpack:dev", err)
    gutil.log("[webpack:build]", stats.toString(
      colors: true
    ))
    cb()
  )
  # devCompiler.run (err, stats) ->
  #   if err then throw new gutil.PluginError("webpack:dev", err)
  #   cb()
