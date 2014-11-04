
var
  gulp         = require("gulp"),
  uncss        = require("gulp-uncss"),
  size         = require("gulp-size"),
  gulpif       = require("gulp-if"),
  handleErrors = require("../util/handleErrors");

gulp.task("uncss", function() {

  var dest  = "public/test";

  return gulp.src("public/css/app.css")
    .pipe(uncss({
      html: ["http://localhost:8080"],
      ignore: [/zen/, /document/, /modal/, /settings/, /button/, /btn/, /toggle/, /menu/, /sidebar/, /dropdown/, /ace/, /editor/, /sr/, /form/, /di/, /not/]
    }))
    .on("error", handleErrors)
    .pipe(gulp.dest(dest))
    .pipe(size());
});
