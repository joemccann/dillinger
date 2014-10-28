
var
  browserSync = require("browser-sync"),
  gulp        = require("gulp");

gulp.task("browserSync", function() {
  browserSync({
    files: ["views/**"],
    proxy: "localhost:8080",
    notify: false
  });
});
