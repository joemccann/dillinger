
'use strict';

var
  // marked = require('marked'),
  katex = require('katex'),
  hljs = require('highlight.js'),
  md = require('markdown-it')({
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(lang, str).value;
      } else {
        return hljs.highlightAuto(str).value;
      }
    }
  });

md.use(require('markdown-it-math'), {
  inlineRenderer: function (str) {
    try {
      return '<span class="math inline">' + katex.renderToString (str) + '</span>';
    } catch (e) {
      return '<span class="math inline">' + e + '</span>';
    }
  },
  blockRenderer: function (str) {
    try {
      return '<span class="math block">' + katex.renderToString (str) + '</span>';
    } catch (e) {
      return '<span class="math block">' + e + '</span>';
    }
  }
});

md
  .use(require('markdown-it-toc'))
  .use(require('markdown-it-footnote'))
  .use(require('markdown-it-sub'))
  .use(require('markdown-it-sup'))
  .use(require('markdown-it-mark'))
  .use(require('markdown-it-deflist'))
  .use(require('markdown-it-ins'))
  .use(require('markdown-it-abbr'))
  .use(require('markdown-it-checkbox'));

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
