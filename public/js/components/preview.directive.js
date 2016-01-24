
'use strict';

var md = require( 'md' ).md;

module.exports =
  angular
  .module('diBase.directives.preview', [])
  .directive('preview', function($rootScope, debounce) {

  var directive = {
    link: function(scope, el, attrs) {

      var delay = attrs.debounce || 200;

      var refreshPreview = function(val) {
        el.html(md.render($rootScope.editor.getSession().getValue()));
        return $rootScope.$emit('preview.updated');
      };

      $rootScope.editor.on('change', debounce(refreshPreview, delay));

      return refreshPreview();
    }
  };

  return directive;
});
