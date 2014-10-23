
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
        $editor = angular.element(document).find('#editor')

        el.bind 'click', ->
          $body.toggleClass('open-menu')
          false

        $editor.bind 'click', ->
          if $body.hasClass 'open-menu'
            $body.toggleClass('open-menu')
          false

    return directive
