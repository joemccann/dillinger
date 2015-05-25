
'use strict';

var md = require( 'md' ).md


module.exports =
  angular
  .module('diBase.directives.preview', [])
  .directive('preview', function($rootScope) {

  var directive = {
    link: function(scope, el, attrs) {

      var refreshPreview = function(val) {
        el.html(md.render($rootScope.editor.getSession().getValue()));
        return $rootScope.$emit('preview.updated');
      };

      $rootScope.editor.on('change', refreshPreview);

      return refreshPreview();
    }
  };

  return directive;
});
