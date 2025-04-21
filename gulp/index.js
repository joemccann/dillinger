'use strict'

const gulp = require('gulp')
const fs = require('fs')
const path = require('path')
const argv = require('yargs').argv
const onlyScripts = require('./util/scriptFilter')

global.isProduction = !!(argv.production || argv.prod)

// Load all tasks
const tasks = fs.readdirSync('./gulp/tasks/')
  .filter(filename => filename.match(/\.js$/))
  .map(filename => path.parse(filename).name)

tasks.forEach(task => {
  const taskModule = require('./tasks/' + task)
  if (typeof taskModule === 'function') {
    gulp.task(task, taskModule)
  }
})

// Export the tasks
module.exports = tasks
