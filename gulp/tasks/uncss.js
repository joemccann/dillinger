'use strict'
const gulp = require('gulp')

const uncss = require('gulp-postcss')

const size = require('gulp-size')

const handleErrors = require('../util/handleErrors')

gulp.task('uncss', function () {
  const dest = 'public/test'

  return gulp.src('public/css/app.css')
    .pipe(uncss({
      html: ['http://localhost:8080'],
      ignore: [/zen/, /document/, /modal/, /settings/, /button/, /btn/, /toggle/, /menu/, /sidebar/, /dropdown/, /ace/, /editor/, /sr/, /form/, /di/, /not/]
    }))
    .on('error', handleErrors)
    .pipe(gulp.dest(dest))
    .pipe(size())
})
