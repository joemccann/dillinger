
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
webpack          = require("webpack")
webpackDevServer = require("webpack-dev-server")
webpackConfig    = require("../../webpack.config")
bundleLogger     = require("../util/bundleLogger")
handleErrors     = require("../util/handleErrors")

webpackDevConfig         = Object.create(webpackConfig)
webpackDevConfig.devtool = "source-map"
webpackDevConfig.debug   = true

devCompiler = webpack(webpackDevConfig)

gulp.task "webpack", (cb) ->

  new webpackDevServer(devCompiler,
    contentBase: "http://localhost:8080/"
    publicPath: "http://localhost:8090/assets/"
    stats:
      colors: true
  ).listen( 8090, "localhost", (err) ->
    if err then throw new gutil.PluginError("webpack:dev", err)
    cb()
  )
  # devCompiler.run (err, stats) ->
  #   if err then throw new gutil.PluginError("webpack:dev", err)
  #   cb()
