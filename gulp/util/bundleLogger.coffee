
# bundleLogger
#   ------------
#   Provides gulp style logs to the bundle method in browserify.js
#
#

gutil          = require("gulp-util")
prettyHrtime   = require("pretty-hrtime")
startTime      = undefined

module.exports =

  start: ->
    startTime = process.hrtime()
    gutil.log "Running", gutil.colors.green("'bundle'") + "..."
    return

  end: ->
    taskTime   = process.hrtime(startTime)
    prettyTime = prettyHrtime(taskTime)
    gutil.log "Finished", gutil.colors.green("'bundle'"), "in", gutil.colors.magenta(prettyTime)
    return
