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
          return hljs.highlightAuto(str).value;
        }
      }
    });

/*
  change pre>code to pre>code.hljs for proper highlight
 */
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

/*
  change table to table.table for proper highlight with Bootstrap
 */
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

exports.md = md 