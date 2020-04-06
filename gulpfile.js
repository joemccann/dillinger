// Load plugins
const browsersync = require('browser-sync').create()
const del = require('del')
const gulp = require('gulp')
const plumber = require('gulp-plumber')
const webpack = require('webpack')
const webpackconfig = require('./webpack.config.js')
const webpackstream = require('webpack-stream')

// Clean assets
function clean () {
  return del(['./public/dist/'])
}

// Transpile, concatenate and minify scripts
function scripts () {
  return (
    gulp
      .src(['./public/js/**/*'])
      .pipe(plumber())
      .pipe(webpackstream(webpackconfig, webpack))
      // folder only, filename is specified in webpack config
      .pipe(gulp.dest('./public/dist/'))
      .pipe(browsersync.stream())
  )
}

// define complex tasks
const js = gulp.series(scripts)
const build = gulp.series(clean, js)

gulp.task('default', build)
