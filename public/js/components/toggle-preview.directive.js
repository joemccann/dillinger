module.exports =
  angular
    .module('diBase.directives.previewToggle', [])
    .directive('previewToggle', () => {
      return {
        link: function (scope, el, attrs) {
          const $body = angular.element(document).find('body')

          return el.bind('click', function () {
            el.toggleClass('open')
            $body.toggleClass('show-preview')
            return false
          })
        }
      }
    })
