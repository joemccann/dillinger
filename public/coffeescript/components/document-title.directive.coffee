
'use strict'

app = require('../dillinger')

module.exports = app.directive 'documentTitle',
  () ->

    directive =
      restrict: 'E'
      templateUrl: '../coffeescript/components/document-title.directive.html'

    return directive
