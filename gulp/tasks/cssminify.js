
var csso, gulp, handleErrors, size;

gulp = require("gulp");

csso = require("gulp-csso");

size = require("gulp-size");

handleErrors = require("../util/handleErrors");

gulp.task("cssminify", function() {
  var dest;
  dest = "./public/css";
  return gulp.src("./public/css/app.css").on("error", handleErrors).pipe(csso()).pipe(gulp.dest(dest)).pipe(size());
});
