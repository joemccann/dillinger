'use strict'

const gulp = require('gulp')
const rev = require('gulp-rev')

function revTask() {
  return gulp.src(['public/dist/**/*.{css,js}'])
    .pipe(rev())
    .pipe(gulp.dest('public/dist'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('public/dist'))
}

gulp.task('rev', revTask)

module.exports = revTask 