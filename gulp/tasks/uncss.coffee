
# compass    = require("gulp-compass")
gulp         = require("gulp")
uncss        = require("gulp-uncss")
size         = require("gulp-size")
gulpif       = require("gulp-if")
handleErrors = require("../util/handleErrors")

gulp.task "uncss", ->

  dest = "./public"
  files = ['./public/index.html']

  gulp.src("./public/app.css")
    .pipe(uncss(
      html: files
    ))
    .on("error", handleErrors)
    .pipe(gulp.dest(dest))
    .pipe(size())
