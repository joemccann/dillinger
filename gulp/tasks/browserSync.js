
'use strict';

var
  browserSync = require('browser-sync'),
  gulp        = require('gulp');

gulp.task('browserSync', function() {
  browserSync({
    files: ['views/**', 'public/**'],
    proxy: 'localhost:8090',
    notify: false
  });
});
