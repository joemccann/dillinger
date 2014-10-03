
fs          = require("fs")
argv        = require("yargs").argv
onlyScripts = require("./util/scriptFilter")
tasks       = fs.readdirSync("./gulp/tasks/").filter(onlyScripts)

global.isProduction = if argv.production or argv.prod then true else false

tasks.forEach (task) ->
  require "./tasks/" + task
  return

