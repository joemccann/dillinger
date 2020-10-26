'use strict'

const gulp = require('gulp')

const sass = require('gulp-sass')

const autoprefixer = require('gulp-autoprefixer')

const cmq = require('gulp-group-css-media-queries')

const csso = require('gulp-csso')

const size = require('gulp-size')

const gulpif = require('gulp-if')

const handleErrors = require('../util/handleErrors')

const browserSync = require('browser-sync')

gulp.task('sass', function () {
  const dest = './public/css'

  console.log('app sass build')

  gulp.src('./public/scss/app.{scss,sass}')
    .pipe(sass({
      precision: 7,
      outputStyle: 'nested'
    }))
    .on('error', handleErrors)
    .pipe(autoprefixer())
    .pipe(gulpif(global.isProduction, cmq({
      log: true
    })))
    .pipe(csso())
    .pipe(gulp.dest(dest))
    .pipe(browserSync.reload({
      stream: true
    }))
    .pipe(size())

  console.log('export sass build')

  return gulp.src('./public/scss/export.{scss,sass}')
    .pipe(sass({
      precision: 7,
      outputStyle: 'nested'
    }))
    .on('error', handleErrors)
    .pipe(autoprefixer())
    .pipe(gulpif(global.isProduction, cmq({
      log: true
    })))
    .pipe(csso())
    .pipe(gulp.dest(dest))
    .pipe(browserSync.reload({
      stream: true
    }))
    .pipe(size())
})
