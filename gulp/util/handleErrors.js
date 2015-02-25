
'use strict';

var
  notify,
  __slice = [].slice;

notify = require('gulp-notify');

module.exports = function() {

  var args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];

  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args);

  this.emit('end');
};
