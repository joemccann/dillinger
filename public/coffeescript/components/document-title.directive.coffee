
'use strict'

app = require('../dillinger')

module.exports = app.directive 'documentTitle',
  () ->

    directive =
      restrict: 'E'
      template: require('raw!./document-title.directive.html')

    return directive
