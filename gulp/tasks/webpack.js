
'use strict'

const gulp = require('gulp')

const gutil = require('gulp-util')

const webpack = require('webpack')

const WebpackDevServer = require('webpack-dev-server')

const webpackConfig = require('../../webpack.config.js')

const NGAnnotatePlugin = require('ng-annotate-webpack-plugin')

gulp.task('webpack:dev', function (cb) {
  const
    webpackDevConfig = Object.create(webpackConfig)

  let devCompiler = null

  webpackDevConfig.devtool = 'eval'

  devCompiler = webpack(webpackDevConfig)

  return new WebpackDevServer(devCompiler, {
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
  const webpackProductionConfig = Object.assign(webpackConfig, {})

  webpackProductionConfig.plugins = webpackProductionConfig.plugins.concat(new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    }
  }),
  new NGAnnotatePlugin({
    add: true
  }),
  new webpack.LoaderOptionsPlugin({
    debug: true
  })
  )

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
