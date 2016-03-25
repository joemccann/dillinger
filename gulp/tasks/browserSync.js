
'use strict';

var
  browserSync = require('browser-sync'),
  gulp        = require('gulp');

gulp.task('browserSync', function() {
  browserSync({
    files: ['views/**'],
    proxy: app.get('bind-address') +'8090',
    notify: false
  });
});
