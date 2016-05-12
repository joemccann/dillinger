var gulp = require('gulp');
var zip = require('gulp-zip');

gulp.task('dist', function() {
    var globs = [
      './**',
      '!node_modules/**/*',
      '!dist/**/*',
      '!.git/**/*',
      '!public/scss/**/*'
    ];

    return gulp.src(globs)
        .pipe(zip('pre-built.zip'))
        .pipe(gulp.dest('dist'))
});
