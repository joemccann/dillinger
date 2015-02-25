
'use strict';

var
  critical = require('critical'),
  gulp = require('gulp');

gulp.task('critical', function() {

  var dest = './public';

  return critical.generateInline({
    base: dest,
    src: 'index.html',
    styleTarget: 'app.css',
    htmlTarget: 'index.html',
    width: 320,
    height: 480,
    minify: true
  });
  
});
