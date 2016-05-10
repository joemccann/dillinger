'use strict';


var hljs = require('highlight.js')
  , katex = require('katex')
  , md = require('markdown-it')({
      linkify: true,
      typographer: true,
      highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(lang, str).value;
        } else {
          return str.value;
        }
      }
    });

/*
  change to Katex for math rendering
 */
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

md.renderer.rules.table_open = function(tokens, idx, options, env, self) {
  var token = tokens[idx];
  token.attrPush([ 'class', 'table table-striped table-bordered' ]);

  return self.renderToken(tokens, idx, options);
};

exports.md = md
