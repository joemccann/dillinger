'use strict'

const gulp = require('gulp')
const rimraf = require('gulp-rimraf')

function cleanTask() {
  return gulp.src(['./public/dist/*'], { read: false })
    .pipe(rimraf({ force: true }))
}

gulp.task('clean', cleanTask)

module.exports = cleanTask 