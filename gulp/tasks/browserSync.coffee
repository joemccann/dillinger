
browserSync = require("browser-sync")
gulp        = require("gulp")

gulp.task "browserSync", ["build"], ->
  browserSync.init ["views/**", "public/css/**", "public/img/**"]

  return

