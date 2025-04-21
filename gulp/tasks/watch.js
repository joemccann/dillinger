'use strict'

const gulp = require('gulp')

// Define the watch task function
function watchTask(cb) {
  // Add watch patterns
  gulp.watch('public/scss/**/*.scss', gulp.series('sass'))
  gulp.watch('public/js/**/*.js', gulp.series('webpack'))
  gulp.watch('public/**/*.html', gulp.series('critical'))
  
  // Call the callback when done
  cb()
}

// Register the watch task using Gulp 4 syntax
gulp.task('watch', watchTask)

module.exports = watchTask
