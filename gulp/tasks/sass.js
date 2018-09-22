'use strict';

var
  gulp = require('gulp'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  cmq = require('gulp-group-css-media-queries'),
  csso = require('gulp-csso'),
  size = require('gulp-size'),
  gulpif = require('gulp-if'),
  handleErrors = require('../util/handleErrors'),
  browserSync = require('browser-sync');

gulp.task('sass', function () {

  var dest = './public/css';

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
    .pipe(size());

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
    .pipe(size());
});
