
'use strict'

app = require('../dillinger')

module.exports = app.directive 'switch',
  () ->

    directive =
      restrict: 'AE'
      replace: true
      scope:
        toggleValue: '=value'
      templateUrl: '../coffeescript/components/switch.directive.html'

    return directive
