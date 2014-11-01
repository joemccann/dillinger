
'use strict';

var
  marked = require('marked'),
  hljs = require('highlight.js');

marked.setOptions({
  gfm: true,
  tables: true,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  langPrefix: 'lang-',
  highlight: function(code) {
    return hljs.highlightAuto(code).value;
  }
});

module.exports =
  angular
  .module('diBase.directives.preview', [])
  .directive('preview', function($rootScope) {

  var directive = {
    link: function(scope, el, attrs) {

      var refreshPreview = function(val) {
        el.html(marked($rootScope.editor.getSession().getValue()));
        return $rootScope.$emit('preview.updated');
      };

      $rootScope.editor.on('change', refreshPreview);

      return refreshPreview();
    }
  };

  return directive;
});
