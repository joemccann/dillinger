
Dillinger = require('../../dillinger')

module.exports = Dillinger.directive 'switch',
  () ->

    directive =
      restrict: 'AE'
      replace: true
      scope:
        toggleValue: '=value'
      templateUrl: '../coffeescript/base/templates/switch.html'

    return directive
