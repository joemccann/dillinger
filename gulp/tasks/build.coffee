
gulp     = require("gulp")
sequence = require("run-sequence")

tasks = [
  "webpack"
  "sass"
  # "images"
  # "copy"
]

if global.isProduction
  gulp.task "build", ->
    sequence tasks, "uncss", "htmlminify", "cssminify"
else
  # tasks.push "html"
  gulp.task "build", tasks
