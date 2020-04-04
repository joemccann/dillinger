
'use strict'

const __slice = [].slice
const notify = require('gulp-notify')

module.exports = function () {
  const args = arguments.length >= 1 ? __slice.call(arguments, 0) : []

  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args)

  this.emit('end')
}
