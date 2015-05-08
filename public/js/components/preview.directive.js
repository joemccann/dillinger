
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



md.renderer.rules.fence = function (tokens, idx, options, env, self) {
  var unescapeAll     = require('markdown-it/lib/common/utils').unescapeAll;
  var escapeHtml      = require('markdown-it/lib/common/utils').escapeHtml;

  var token = tokens[idx],
      langName = '',
      highlighted;

  if (token.info) {
    langName = unescapeAll(token.info.trim().split(/\s+/g)[0]);
    token.attrPush(['class', options.langPrefix + langName + ' hljs']);
  } else {
    token.attrPush(['class', 'hljs']);
  }

  if (options.highlight) {
    highlighted = options.highlight(token.content, langName) || escapeHtml(token.content);
  } else {
    highlighted = escapeHtml(token.content);
  }

  return  '<pre' + self.renderAttrs(token) + '><code>'
        + highlighted
        + '</code></pre>\n';
};

md.renderer.rules.table_open = function (tokens, idx, options, env, self) {

  var token = tokens[idx];
  
  var index = token.attrIndex('class');
  if (index >= 0) {
    token.attrs[index][1] += ' table table-striped';
  } else {
    token.attrPush(['class', 'table table-striped']);
  }

  return self.renderToken(tokens, idx, options);
};

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

// marked.setOptions({
//   gfm: true,
//   tables: true,
//   pedantic: false,
//   sanitize: true,
//   smartLists: true,
//   smartypants: false,
//   langPrefix: 'lang-',
//   highlight: function(code) {
//     return hljs.highlightAuto(code).value;
//   }
// });

module.exports =
  angular
  .module('diBase.directives.preview', [])
  .directive('preview', function($rootScope) {

  var directive = {
    link: function(scope, el, attrs) {

      var refreshPreview = function(val) {
        // el.html(marked($rootScope.editor.getSession().getValue()));
        // el.html ("hahaha");
        el.html(md.render($rootScope.editor.getSession().getValue()));
        return $rootScope.$emit('preview.updated');
      };

      $rootScope.editor.on('change', refreshPreview);

      return refreshPreview();
    }
  };

  return directive;
});
