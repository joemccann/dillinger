const hljs = require('highlight.js')
const katex = require('katex')
const md = require('markdown-it')({
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(lang, str).value
    } else {
      return str.value
    }
  }
})

md
  .use(require('markdown-it-toc'))
  .use(require('markdown-it-footnote'))
  .use(require('markdown-it-sub'))
  .use(require('markdown-it-sup'))
  .use(require('markdown-it-mark'))
  .use(require('markdown-it-deflist'))
  .use(require('markdown-it-ins'))
  .use(require('markdown-it-abbr'))
  .use(require('markdown-it-checkbox'))
  .use(require('markdown-it-texmath'), { 
    engine: require('katex'),
    delimiters: 'dollars' 
  })


md.renderer.rules.table_open = function (
  tokens, idx, options, env, self
) {
  var token = tokens[idx]
  token.attrPush(['class', 'table table-striped table-bordered'])

  return self.renderToken(tokens, idx, options)
}

const lineNumberRendererRuleNames = [
  'paragraph_open',
  'image',
  'code_block',
  'fence',
  'list_item_open'
]

lineNumberRendererRuleNames.forEach(function (ruleName) {
  var original = md.renderer.rules[ruleName]
  md.renderer.rules[ruleName] = function (tokens, idx, options, env, self) {
    var token = tokens[idx]
    if (token.map && token.map.length) {
      token.attrPush(['class', 'has-line-data'])
      if (ruleName === 'fence') {
        token.attrPush(['data-line-start', token.map[0] + 1])
      } else {
        token.attrPush(['data-line-start', token.map[0]])
      }
      token.attrPush(['data-line-end', token.map[1]])
    }

    if (original) {
      return original(tokens, idx, options, env, self)
    } else {
      return self.renderToken(tokens, idx, options, env, self)
    }
  }
})

/**
 * Override markdown-it-toc heading_open rule, add line count attributes
 * See: https://unpkg.com/markdown-it-toc@1.1.0/index.js#L69-78
 */
md.renderer.rules.heading_open = function (tokens, idx) {
  var token = tokens[idx]
  var level = token.tag
  var label = tokens[idx + 1]
  var makeSafe = function (label) {
    return label.replace(/[^\w\s]/gi, '').split(' ').join('_')
  }
  if (label.type === 'inline') {
    var anchor = makeSafe(label.content) + '_' + label.map[0]
    return '<' + level +
      ' ' + 'class="code-line"' +
      ' ' + 'data-line-start=' + token.map[0] +
      ' ' + 'data-line-end=' + token.map[1] +
      ' ' + '>' +
      '<a id="' + anchor + '"></a>'
  } else {
    return '</h1>'
  }
}

module.exports = md
