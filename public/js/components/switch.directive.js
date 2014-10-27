
'use strict';
module.exports = angular.module('diBase.directives.switch', []).directive('switch', function() {
  var directive;
  directive = {
    restrict: 'AE',
    replace: true,
    scope: {
      toggleValue: '=value'
    },
    template: require('raw!./switch.directive.html')
  };
  return directive;
});
