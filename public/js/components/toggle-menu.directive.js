
'use strict';
module.exports = angular.module('diBase.directives.menuToggle', []).directive('menuToggle', function() {
  var directive;
  directive = {
    restrict: 'E',
    replace: true,
    template: require('raw!./toggle-menu.directive.html'),
    link: function(scope, el, attrs) {
      var $body, $editor;
      $body = angular.element(document).find('body');
      $editor = angular.element(document).find('#editor');
      el.bind('click', function() {
        $body.toggleClass('open-menu');
        return false;
      });
      return $editor.bind('click', function() {
        if ($body.hasClass('open-menu')) {
          $body.toggleClass('open-menu');
        }
        return false;
      });
    }
  };
  return directive;
});
