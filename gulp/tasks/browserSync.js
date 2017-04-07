
'use strict';

var
  browserSync = require('browser-sync'),
  gulp        = require('gulp');

gulp.task('browserSync', function() {
  browserSync({
    files: ['views/**', 'public/**'],
    proxy: 'dillinger.io:8090',
    notify: true,
    port: 80,
    host: 'dillinger.io',
    open: 'external'
  });
});

