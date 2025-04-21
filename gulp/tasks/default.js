'use strict'

const gulp = require('gulp')

// Update to Gulp 4 task syntax
function defaultTask(cb) {
  // Add your default task logic here
  cb()
}

gulp.task('default', defaultTask)

module.exports = defaultTask
