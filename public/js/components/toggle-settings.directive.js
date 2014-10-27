
'use strict';
module.exports = angular.module('diBase.directives.settingsToggle', []).directive('settingsToggle', function() {
  var directive;
  directive = {
    link: function(scope, el, attrs) {
      var $body, $overlay;
      $body = angular.element(document).find('body');
      $overlay = angular.element(document).find('.overlay');
      el.bind('click', function() {
        el.toggleClass('open');
        return $body.toggleClass('show-settings');
      });
      return $overlay.bind('click', function() {
        if ($body.hasClass('show-settings')) {
          el.toggleClass('open');
          return $body.toggleClass('show-settings');
        }
      });
    }
  };
  return directive;
});
