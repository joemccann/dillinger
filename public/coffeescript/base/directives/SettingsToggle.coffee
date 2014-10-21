
Dillinger = require('../../dillinger')

settingsToggle = Dillinger.directive 'settingsToggle',
  () ->

    directive =
      link: (scope, el, attrs) ->

        $body    = angular.element(document).find('body')
        $overlay = angular.element(document).find('.overlay')

        el.bind 'click', ->
          $body.toggleClass('show-settings')

        $overlay.bind 'click', ->
          if $body.hasClass 'show-settings'
            $body.toggleClass('show-settings')

    return directive

module.exports = settingsToggle
