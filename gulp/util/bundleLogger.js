
'use strict';

var
  gutil        = require('gulp-util'),
  prettyHrtime = require('pretty-hrtime'),
  startTime    = void 0;

module.exports = {

  start: function() {
    startTime = process.hrtime();
    gutil.log('Running', gutil.colors.green('bundle') + '...');
  },

  end: function() {
    var prettyTime, taskTime;
    taskTime = process.hrtime(startTime);
    prettyTime = prettyHrtime(taskTime);
    gutil.log('Finished', gutil.colors.green('bundle'), 'in', gutil.colors.magenta(prettyTime));
  }

};
