
'use strict'
module.exports =
  angular
    .module('diBase.directives.settingsToggle', [])
    .directive('settingsToggle', () => {
      return {
        link: (scope, el, attrs) => {
          const $body = angular.element(document).find('body')
          const $overlay = angular.element(document).find('.overlay')

          el.bind('click', () => {
            el.toggleClass('open')
            $body.toggleClass('show-settings')
            return false
          })

          $overlay.bind('click', () => {
            if ($body.hasClass('show-settings')) {
              el.toggleClass('open')
              $body.toggleClass('show-settings')
            }
            return false
          })
        }
      }
    })
