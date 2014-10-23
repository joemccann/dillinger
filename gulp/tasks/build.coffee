
gulp     = require("gulp")
sequence = require("run-sequence")

devTasks = [
  "webpack:dev"
  "sass"
]

buildTasks = [
  "webpack:build"
  "sass"
]

if global.isProduction
  gulp.task "build", ->
    sequence buildTasks #, "uncss", "htmlminify", "cssminify"
else
  # tasks.push "html"
  gulp.task "build", devTasks
