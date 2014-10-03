
gulp     = require("gulp")

gulp.task "copy", ->

  files = [
    "./src/htdocs/*.{xml,ico,png,txt,htaccess}"
  ]

  gulp.src(files)
    .pipe(gulp.dest("./public"))

