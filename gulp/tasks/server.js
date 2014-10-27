
var gulp;

gulp = require("gulp");

gulp.task("server", ["setWatch", "browserSync"], function() {
  gulp.watch("public/scss/**", ["sass"]);
});
