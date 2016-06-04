var gulp = require('gulp');
var zip = require('gulp-zip');
var tar = require('gulp-tar');
var gzip = require('gulp-gzip');

var globs = [
  './**',
  '!node_modules/**/*',
  '!gulp/**/*',
  '!dist/**/*',
  '!.git/**/*',
  '!public/scss/**/*'
];

gulp.task('dist', function() {
    var src = gulp.src(globs);

    src.pipe(tar('pre-built.tar'))
      .pipe(gzip())
      .pipe(gulp.dest('dist'));

    src.pipe(zip('pre-built.zip'))
      .pipe(gulp.dest('dist'));

    return src;
});
