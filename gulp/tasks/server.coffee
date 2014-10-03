
gulp = require("gulp")

gulp.task "server", [
  "setWatch"
  "browserSync"
], ->
  # gulp.watch "src/sass/grid.{scss,sass}", ["grid"]
  # gulp.watch "public/img/**", ["images"]
  gulp.watch "public/scss/**", ["sass"]
  # gulp.watch "public/htdocs/**", ["copy"]
  return


# Note: The browserify task handles js recompiling with watchify
