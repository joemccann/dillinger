const gulp = require('gulp')
const zip = require('gulp-zip')
const tar = require('gulp-tar')
const gzip = require('gulp-gzip')

const globs = [
  './**',
  '!node_modules/**/*',
  '!gulp/**/*',
  '!dist/**/*',
  '!.git/**/*',
  '!public/scss/**/*'
]

gulp.task('dist', function () {
  const src = gulp.src(globs)

  src.pipe(tar('pre-built.tar'))
    .pipe(gzip())
    .pipe(gulp.dest('dist'))

  src.pipe(zip('pre-built.zip'))
    .pipe(gulp.dest('dist'))

  return src
})
