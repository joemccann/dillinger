
'use strict';

var
  gulp         = require('gulp'),
  sass         = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  cmq          = require('gulp-combine-media-queries'),
  csso         = require('gulp-csso'),
  size         = require('gulp-size'),
  gulpif       = require('gulp-if'),
  handleErrors = require('../util/handleErrors'),
  browserSync  = require('browser-sync');

gulp.task('sass', function() {

  var dest = './public/css';

  return gulp.src('./public/scss/app.{scss,sass}')
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
    .pipe(browserSync.reload({stream:true}))
    .pipe(size());
});
