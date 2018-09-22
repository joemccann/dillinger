
'use strict'

module.exports =
  angular
    .module('diBase.directives.documentTitle', [])
    .directive('documentTitle', function () {
      var directive = {
        restrict: 'E',
        template: require('raw-loader!./document-title.directive.html')
      }

      return directive
    })
