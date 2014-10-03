"use strict"

notify = require("gulp-notify")

module.exports = (args...) ->

  # Send error to notification center with gulp-notify
  notify.onError(
    title: "Compile Error"
    message: "<%= error.message %>"
  ).apply this, args

  # Keep gulp from hanging on this task
  @emit "end"
  return
