
'use strict'

module.exports =
  angular
    .module('diZenMode.directives', [])
    .directive('toggleZenMode', function () {
      var directive

      directive = {
        restrict: 'E',
        replace: true,
        controller: 'diZenMode',
        controllerAs: 'zenmode',
        template: require('raw-loader!./zen-mode-toggle.directive.html')
      }

      return directive
    })
