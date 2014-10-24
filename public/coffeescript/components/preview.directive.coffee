
'use strict'

app    = require('../dillinger')
marked = require('marked')
hljs   = require('highlight.js')

marked.setOptions
  gfm: true
  tables: true
  pedantic: false
  sanitize: true
  smartLists: true
  smartypants: false
  langPrefix: 'lang-'
  highlight: (code) ->
    hljs.highlightAuto(code).value

module.exports = app.directive 'preview',
  ($rootScope) ->

    directive =
      link: (scope, el, attrs) ->

        refreshPreview = (val) ->
          el.html(marked($rootScope.editor.getSession().getValue()))
          $rootScope.$emit 'preview.updated'

        $rootScope.editor.on 'change', refreshPreview
        refreshPreview()

    return directive
