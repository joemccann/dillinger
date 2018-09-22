
'use strict'

const fs = require('fs')
const argv = require('yargs').argv
const onlyScripts = require('./util/scriptFilter')
const tasks = fs.readdirSync('./gulp/tasks/').filter(onlyScripts)

global.isProduction = !!(argv.production || argv.prod)

tasks.forEach(function (task) {
  require('./tasks/' + task)
})
