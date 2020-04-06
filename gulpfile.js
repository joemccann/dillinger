// require('es6-promise').polyfill()
// require('./gulp/all')

const del = require('del')
const gulp = require('gulp')
const browserSync = require('browser-sync')
const webpack = require('webpack')
const webpackConfig = require('./webpack.config.js')
const NGAnnotatePlugin = require('ng-annotate-webpack-plugin')
const gutil = require('gulp-util')

const wp = (done) => {
  const webpackProductionConfig = Object.assign(webpackConfig, {})

  webpackProductionConfig.plugins = webpackProductionConfig
    .plugins.concat(new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
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

    done()
  })
}

const server = browserSync.create()

const paths = {
  scripts: {
    src: 'public/',
    dest: 'public/dist/'
  }
}

const clean = () => del(['public/dist'])

function reload (done) {
  server.reload()
  done()
}

function serve (done) {
  server.init({
    proxy: '127.0.0.1:8080'
  })
  done()
}

const watch = () => gulp.watch(paths.scripts.src, gulp.series(wp, reload))

const dev = gulp.series(clean, wp, serve, watch)

gulp.task('default', dev)
