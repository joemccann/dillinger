'use strict'

const gulp = require('gulp')
const critical = require('critical')

function criticalTask(cb) {
  // Skip critical CSS generation in development
  if (!global.isProduction) {
    return cb()
  }

  const dest = './public/dist'

  return critical.generate({
    base: './public/',  // Changed base directory
    src: 'views/index.ejs',  // Changed to look for the EJS template
    css: ['css/app.css'],  // Updated CSS path
    target: {
      css: 'dist/critical.css',
      html: 'dist/index.html'
    },
    width: 1300,
    height: 900,
    minify: true,
    ignore: ['@font-face', /url\(/]  // Ignore font-face and url references
  }).catch(err => {
    console.error('Critical CSS error:', err)
    // Don't fail the build on critical CSS error
    cb()
  })
}

gulp.task('critical', criticalTask)

module.exports = criticalTask
