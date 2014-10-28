
'use strict';
module.exports =
  angular
  .module('diBase.directives.settingsToggle', [])
  .directive('settingsToggle', function() {

  var directive = {
    link: function(scope, el, attrs) {

      var
        $body = angular.element(document).find('body'),
        $overlay = angular.element(document).find('.overlay');

      el.bind('click', function() {
        el.toggleClass('open');
        $body.toggleClass('show-settings');
        return false;
      });

      $overlay.bind('click', function() {
        if ($body.hasClass('show-settings')) {
          el.toggleClass('open');
          $body.toggleClass('show-settings');
        }
        return false;
      });

      return;
    }
  };
  return directive;
});
