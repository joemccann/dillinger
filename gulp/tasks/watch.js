
'use strict';

var gulp = require('gulp');

gulp.task('watch', ['setWatch', 'build', 'browserSync'], function() {
  gulp.watch('public/scss/**/*.{scss,sass,css}', ['sass']);
});
