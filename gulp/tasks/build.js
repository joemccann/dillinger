
var
  gulp       = require("gulp"),
  sequence   = require("run-sequence"),
  devTasks   = ["webpack:dev", "sass"],
  buildTasks = ["webpack:build", "sass"];

if (global.isProduction) {
  gulp.task("build", function() {
    return sequence(buildTasks);
  });
} else {
  gulp.task("build", devTasks);
}
