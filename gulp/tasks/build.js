'use strict'

const gulp = require('gulp')

// Define build task function
function buildTask(cb) {
  // Check if we're in production mode
  const isProduction = global.isProduction

  // Define the sequence of tasks
  const buildTasks = gulp.series(
    'clean',
    gulp.parallel(
      'sass',
      isProduction ? 'webpack:build' : 'webpack:dev'
    )
  )

  // Run the build sequence
  return buildTasks(cb)
}

// Register build task
gulp.task('build', buildTask)

module.exports = buildTask
