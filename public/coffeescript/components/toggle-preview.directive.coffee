
'use strict'

app = require('../dillinger')

module.exports = app.directive 'previewToggle',
  () ->

    directive =
      link: (scope, el, attrs) ->

        $body    = angular.element(document).find('body')

        el.bind 'click', ->
          el.toggleClass('open')
          $body.toggleClass('show-preview')
          false

    return directive
