
'use strict'

marked = require('marked')
hljs   = require('highlight.js')

marked.setOptions
  gfm: true
  tables: true
  pedantic: false
  sanitize: false
  smartLists: true
  smartypants: false
  langPrefix: 'lang-'
  highlight: (code) ->
    hljs.highlightAuto(code).value

module.exports =
  angular
  .module('diBase.directives.preview', [])
  .directive 'preview',
  ($rootScope) ->

    directive =
      link: (scope, el, attrs) ->

        refreshPreview = (val) ->
          el.html(marked($rootScope.editor.getSession().getValue()))
          $rootScope.$emit 'preview.updated'

        $rootScope.editor.on 'change', refreshPreview
        refreshPreview()

    return directive
