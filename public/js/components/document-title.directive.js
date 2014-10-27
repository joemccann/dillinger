
'use strict';
module.exports = angular.module('diBase.directives.documentTitle', []).directive('documentTitle', function() {
  var directive;
  directive = {
    restrict: 'E',
    template: require('raw!./document-title.directive.html')
  };
  return directive;
});
