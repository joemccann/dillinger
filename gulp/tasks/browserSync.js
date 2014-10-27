
var browserSync, gulp;

browserSync = require("browser-sync");

gulp = require("gulp");

gulp.task("browserSync", ["build"], function() {
  browserSync.init(["views/**", "public/css/**", "public/img/**"], {
    notify: false
  });
});
