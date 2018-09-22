
'use strict'

var
  gulp = require('gulp')

var gulpif = require('gulp-if')

var gutil = require('gulp-util')

var webpack = require('webpack')

var webpackDevServer = require('webpack-dev-server')

var webpackConfig = require('../../webpack.config')

var bundleLogger = require('../util/bundleLogger')

var handleErrors = require('../util/handleErrors')

var ngAnnotatePlugin = require('ng-annotate-webpack-plugin')

gulp.task('webpack:dev', function (cb) {
  var
    webpackDevConfig = Object.create(webpackConfig)

  var devCompiler

  webpackDevConfig.devtool = 'eval'
  webpackDevConfig.debug = true

  devCompiler = webpack(webpackDevConfig)

  return new webpackDevServer(devCompiler, {
    proxy: {
      '*': {
        target: 'http://127.0.0.1:8080',
        secure: false
      }
    },
    publicPath: 'http://127.0.0.1:8090/js/',
    hot: false,
    stats: {
      colors: true
    }
  }).listen(8090, '127.0.0.1', function (err) {
    if (err) {
      throw new gutil.PluginError('webpack:dev', err)
    }

    return cb()
  })
})

gulp.task('webpack:build', function (cb) {
  var webpackProductionConfig = Object.create(webpackConfig)

  webpackProductionConfig.plugins = webpackProductionConfig.plugins.concat(new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    }
  }),
  new webpack.optimize.DedupePlugin(),
  new ngAnnotatePlugin({
    add: true
  }),
  new webpack.optimize.UglifyJsPlugin())

  return webpack(webpackProductionConfig, function (err, stats) {
    if (err) {
      throw new gutil.PluginError('webpack:dev', err)
    }

    gutil.log('[webpack:build]', stats.toString({
      colors: true
    }))

    return cb()
  })
})
