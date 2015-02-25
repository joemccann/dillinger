
'use strict';

var
  fs          = require('fs'),
  argv        = require('yargs').argv,
  onlyScripts = require('./util/scriptFilter'),
  tasks       = fs.readdirSync('./gulp/tasks/').filter(onlyScripts);

global.isProduction = argv.production || argv.prod ? true : false;

tasks.forEach(function(task) {
  require('./tasks/' + task);
});
