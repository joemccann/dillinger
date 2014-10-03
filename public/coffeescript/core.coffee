
window.jQuery      = require('jquery')
ace         = require('brace')
# keymaster = require('keymaster')
marked      = require('marked')
localFiles  = require('./localFiles')
highlight   = require('highlight.js')

require 'brace/mode/markdown'
require 'brace/theme/monokai'

require 'bootstrap/js/dropdown'

do ($ = jQuery, window, document) ->

  'use strict'

  window.Dillinger =
    Editor: null
    EditorSettings:
      language: 'markdown'
      Markdown:
        type: 'markdown'
        name: 'Markdown'
        fileExts: ['.md', '.markdown', '.mdown']
    Profile:
      NightMode: false
      CurrentFile: null
      CurrentFileName: 'Untitled Document.md'
      WordCount: true
      AutoSave:
        enabled: true
        interval: 3000
        fn: undefined
      Github:
        current_uri: ''
        opts: {}
      Dropbox:
        filepath: '/Dillinger/'
      local_files: {}

    $preview:       $('#preview')
    $editor:        $('#editor')
    $documentName:  $('.title-document')
    $documentList:  $('.dropdown.documents')
    $wordcount:     $('.counter')
    $saveDocButton: $('.btn--save')
    $newDocButton:  $('.btn--new')

    init: ->

      Dillinger.getUserProfile()

      marked.setOptions
        gfm: true
        tables: true
        pedantic: false
        sanitize: true
        smartLists: true
        smartypants: false
        langPrefix: 'lang-'
        highlight: (code) ->
          return highlight.highlightAuto(code).value

      Dillinger.initEditor()
      Dillinger.initUI()

      Dillinger.refreshPreview()
      Dillinger.bindPreview()

      Dillinger.refreshWordCount()
      Dillinger.bindWordCount()


      # localFiles.load()
      localFiles.save(Dillinger.$documentName.text(), Dillinger.Editor.getSession().getValue())
      Dillinger.$documentList.html localFiles.getList()

      Dillinger.bindLayoutEvents()
      return

    initEditor: ->
      Dillinger.Editor = ace.edit 'editor'
      Dillinger.Editor.getSession().setMode('ace/mode/markdown')
      Dillinger.Editor.getSession().setUseWrapMode(true)
      Dillinger.Editor.setShowPrintMargin(false)
      Dillinger.Editor.getSession().setValue(Dillinger.Profile.CurrentFile or Dillinger.Editor.getSession().getValue())
      return

    initUI: ->
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

    getUserProfile: ->
      try
        p = JSON.parse(localStorage.Profile)
        p = $.extend(true, Dillinger.Profile, p)
      catch e
        p = Dillinger.Profile
      p

    updateUserProfile: (obj) ->
      localStorage.clear()
      localStorage.Profile = JSON.stringify($.extend(true, Dillinger.Profile, obj))

    saveFile: ->
      Dillinger.updateUserProfile
        CurrentFile: Dillinger.Editor.getSession().getValue()

    autoSave: ->
      if Dillinger.Profile.AutoSave.enabled is true
        Dillinger.Profile.AutoSave.fn = setInterval ->
          Dillinger.saveFile()
        , Dillinger.Profile.AutoSave.interval
      else
        clearInterval Dillinger.Profile.AutoSave.fn
      return

    resetProfile: ->
      localStorage.clear()
      Dillinger.Profile.AutoSave.enabled = false
      # Delete the property altogether --> need ; for JSHint bug.
      localStorage.profile = null
      # Now reload the page to start fresh
      window.location.reload()

    getTextInElement: (node) ->
      return node.data if node.nodeType is 3
      txt = ""
      if node = node.firstChild
        loop
          txt += Dillinger.getTextInElement(node)
          break unless node = node.nextSibling
      txt

    refreshWordCount: (selectionCount) ->
      if Dillinger.Profile.WordCount is true
        Dillinger.$wordcount.html(Dillinger.countWords(Dillinger.getTextInElement(Dillinger.$preview[0])))
      return

    bindWordCount: (selectionCount) ->
      Dillinger.$editor.bind 'keyup', Dillinger.refreshWordCount
      return

    countWords: (str) ->
      words = str
        .replace(/W+/g, ' ')
        .match(/\S+/g)

      return words and words.length or 0

    getWordCount: ->
      if Dillinger.Profile.WordCount is true
        Dillinger.$wordcount.text()

    bindLayoutEvents: ->
      $('.menu-sidebar').on 'click', '.menu-item', ->
        $that = $(@)
        $that.toggleClass('open')

      $('.toggle').on 'click', ->
        $('body').toggleClass('open-menu')

      Dillinger.$saveDocButton.on 'click', (e) ->
        e.preventDefault()
        Dillinger.saveFile()
        localFiles.save(Dillinger.$documentName.text(), Dillinger.Editor.getSession().getValue())
        return

      Dillinger.$newDocButton.on 'click', (e) ->
        e.preventDefault()
        localFiles.createNewDocument(Dillinger.$documentName, Dillinger.Editor)
        Dillinger.refreshPreview()
        Dillinger.refreshWordCount()
        return

      return


  module.exports = Dillinger
