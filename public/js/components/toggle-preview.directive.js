
'use strict';
module.exports =
  angular
  .module('diBase.directives.previewToggle', [])
  .directive('previewToggle', function() {

  var directive = {
    link: function(scope, el, attrs) {

      var $body = angular.element(document).find('body');

      return el.bind('click', function() {
        el.toggleClass('open');
        $body.toggleClass('show-preview');
        return false;
      });
    }
  };

  return directive;
});
