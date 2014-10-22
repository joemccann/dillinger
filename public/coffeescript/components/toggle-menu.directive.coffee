
'use strict'

app = require('../dillinger')

module.exports = app.directive 'menuToggle',
  () ->

    directive =
      restrict: 'E'
      replace: true
      templateUrl: '../coffeescript/components/toggle-menu.directive.html'
      link: (scope, el, attrs) ->

        $body = angular.element(document).find('body')
        $page = angular.element(document).find('.page')

        el.bind 'click', ->
          $body.toggleClass('open-menu')
          false

        $page.bind 'click', ->
          if $body.hasClass 'open-menu'
            $body.toggleClass('open-menu')
          false

    return directive
