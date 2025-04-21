'use strict'

const gulp = require('gulp')
const sass = require('gulp-sass')(require('sass'))
const autoprefixer = require('gulp-autoprefixer')
const cmq = require('gulp-group-css-media-queries')
const csso = require('gulp-csso')
const size = require('gulp-size')
const gulpif = require('gulp-if')
const handleErrors = require('../util/handleErrors')
const browserSync = require('browser-sync')

function sassTask() {
  const dest = './public/css'

  console.log('app sass build')

  gulp.src('./public/scss/app.{scss,sass}')
    .pipe(sass({
      precision: 7,
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulpif(global.isProduction, cmq({
      log: true
    })))
    .pipe(csso())
    .pipe(gulp.dest(dest))
    .pipe(browserSync.reload({
      stream: true
    }))
    .pipe(size({ showFiles: true }))

  console.log('export sass build')

  return gulp.src('./public/scss/export.{scss,sass}')
    .pipe(sass({
      precision: 7,
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulpif(global.isProduction, cmq({
      log: true
    })))
    .pipe(csso())
    .pipe(gulp.dest(dest))
    .pipe(browserSync.reload({
      stream: true
    }))
    .pipe(size({ showFiles: true }))
}

gulp.task('sass', sassTask)

module.exports = sassTask
