
$         = require('jquery')
ace       = require('brace')
# keymaster = require('keymaster')
marked    = require('marked')
# highlight = require('highlight').Highlight

require 'brace/mode/markdown'
require 'brace/theme/monokai'

do ($, window, document) ->

  'use strict'

  Dillinger =
    Editor: null
    EditorSettings:
      language: 'markdown'
      Markdown:
        type: 'markdown'
        name: 'Markdown'
        fileExts: ['.md', '.markdown', '.mdown']
    Profile:
      NightMode: false
      CurrentFile: 'null'
      CurrentFileName: 'Untitled Document.md'
      WordCount: true
      AutoSave:
        enabled: true
        interval: 3000
      Github:
        current_uri: ''
        opts: {}
      Dropbox:
        filepath: '/Dillinger/'
      local_files: {}

    $preview:      $('#preview')
    $editor:       $('#editor')
    $documentname: $('#document-name')

    init: ->

      Dillinger.initEditor()
      Dillinger.initUI()
      Dillinger.addLayoutEvents()
      Dillinger.refreshPreview()
      Dillinger.bindPreview()
      return

    initEditor: ->
      Dillinger.Editor = ace.edit 'editor'
      Dillinger.Editor.getSession().setMode('ace/mode/markdown')
      return

    initUI: ->
      Dillinger.Editor.getSession().setUseWrapMode(true)
      Dillinger.Editor.setShowPrintMargin(false)
      # Dillinger.Editor.setTheme 'ace/theme/monokai'
      return

    refreshPreview: ->
      unmd = Dillinger.Editor.getSession().getValue()
      md = marked(unmd)
      Dillinger.$preview.html(md)
      return

    bindPreview: ->
      Dillinger.$editor.on 'keyup', Dillinger.refreshPreview
      return

    addLayoutEvents: ->
      $('.menu-sidebar').on 'click', '.menu-item', ->
        $that = $(@)
        $that.toggleClass('open')

      $('.toggle').on 'click', ->
        $('body').toggleClass('open-menu')

      return


  module.exports = Dillinger
