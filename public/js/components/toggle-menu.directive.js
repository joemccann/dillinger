
const template = require('./toggle-menu.directive.html')

module.exports =
  angular
    .module('diBase.directives.menuToggle', [])
    .directive('menuToggle', () => {
      return {
        restrict: 'E',
        replace: true,
        template,
        link: (scope, el, attrs) => {
          const $body = angular.element(document).find('body')
          const $editor = angular.element(document).find('#editor')

          el.bind('click', function () {
            $body.toggleClass('open-menu')
            return false
          })

          $editor.bind('click', function () {
            if ($body.hasClass('open-menu')) {
              $body.toggleClass('open-menu')
            }
            return false
          })
        }
      }
    })
