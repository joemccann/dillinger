
'use strict'

const browserSync = require('browser-sync')

const gulp = require('gulp')

gulp.task('browserSync', function () {
  browserSync({
    files: ['views/**', 'public/**'],
    proxy: '127.0.0.1:8090',
    notify: true,
    port: 8090,
    host: '127.0.0.1',
    open: 'external'
  })
})
