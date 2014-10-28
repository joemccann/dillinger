
var
  browserSync = require("browser-sync"),
  gulp        = require("gulp");

gulp.task("browserSync", function() {
  browserSync({
    proxy: "localhost:8080",
    notify: false
  });
});
