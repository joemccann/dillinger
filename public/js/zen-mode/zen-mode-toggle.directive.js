const template = require('./zen-mode-toggle.directive.html')

module.exports =
  angular
    .module('diZenMode.directives', [])
    .directive('toggleZenMode', () => {
      return {
        restrict: 'E',
        replace: true,
        controller: 'diZenMode',
        controllerAs: 'zenmode',
        template
      }
    })
