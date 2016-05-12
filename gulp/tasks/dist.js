var gulp = require('gulp');
var tar = require('gulp-tar');
var gzip = require('gulp-gzip');

gulp.task('dist', function() {
    var globs = [
      './**',
      '!node_modules/**/*',
      '!dist/**/*',
      '!.git/**/*',
      '!public/scss/**/*'
    ];

    return gulp.src(globs)
        .pipe(tar('dillinger.tar'))
        .pipe(gzip())
        .pipe(gulp.dest('dist'))
});
