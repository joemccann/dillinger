
Dillinger = require('../../dillinger')

menuToggle = Dillinger.directive 'menuToggle',
  () ->

    directive =
      restrict: 'E'
      replace: true
      templateUrl: '../coffeescript/base/templates/menu-toggle.html'
      link: (scope, el, attrs) ->

        $body = angular.element(document).find('body')

        el.bind 'click', ->
          $body.toggleClass('open-menu')

    return directive

module.exports = menuToggle
