'use strict'

const gulp = require('gulp')
const webpack = require('webpack')
const webpackConfig = require('../../webpack.config.js')

function webpackBuildTask(callback) {
  const config = Object.assign({}, webpackConfig, {
    mode: 'production'
  })

  webpack(config, (err, stats) => {
    if (err) {
      console.error(err)
      return callback(err)
    }

    console.log(stats.toString({
      colors: true
    }))

    callback()
  })
}

function webpackDevTask(callback) {
  const config = Object.assign({}, webpackConfig, {
    mode: 'development'
  })

  webpack(config, (err, stats) => {
    if (err) {
      console.error(err)
      return callback(err)
    }

    console.log(stats.toString({
      colors: true
    }))

    callback()
  })
}

gulp.task('webpack:build', webpackBuildTask)
gulp.task('webpack:dev', webpackDevTask)

module.exports = {
  build: webpackBuildTask,
  dev: webpackDevTask
}
