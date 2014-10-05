
window.jQuery = require('jquery')
ace           = require('brace')
# keymaster   = require('keymaster')
marked        = require('marked')
Switchery     = require('switchery-browserify')
# highlight   = require('highlight.js')

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
        # fileExts: ['.md', '.markdown', '.mdown']
    User: null
    FileHandler: null

    $preview:            $('#preview')
    $editor:             $('#editor')
    $documentName:       $('.title-document')
    $documentList:       $('.dropdown.documents')
    $wordcount:          $('.counter')
    $saveDocButton:      $('.btn--save')
    $newDocButton:       $('.btn--new')
    $deleteDocButton:    $('.btn--delete')
    $showPreviewButton:  $('.menu-link-preview')
    $showSettingsButton: $('.menu-link-settings')
    switches:            Array.prototype.slice.call(document.querySelectorAll('.js-switch'))

    init: ->

      Dillinger.User.init()

      marked.setOptions
        gfm: true
        tables: true
        pedantic: false
        sanitize: true
        smartLists: true
        smartypants: false
        langPrefix: 'lang-'
        # highlight: (code) ->
        #   return highlight.highlightAuto(code).value

      Dillinger.initEditor()
      Dillinger.initUI()

      Dillinger.refreshPreview()
      Dillinger.bindPreview()

      Dillinger.refreshWordCount()
      Dillinger.bindWordCount()

      Dillinger.FileHandler.saveFile()
      Dillinger.FileHandler.showFilesInSidebar()
      # Dillinger.FileHandler.showFilesInSidebar()
      # localFiles.load()
      # localFiles.saveFile(Dillinger.$documentName.text(), Dillinger.Editor.getSession().getValue())
      # Dillinger.$documentList.html localFiles.getFiles()

      Dillinger.bindLayoutEvents()
      return

    initEditor: ->
      Dillinger.Editor = ace.edit 'editor'
      Dillinger.Editor.getSession().setMode('ace/mode/markdown')
      Dillinger.Editor.getSession().setUseWrapMode(true)
      Dillinger.Editor.setShowPrintMargin(false)
      Dillinger.Editor.getSession().setValue(Dillinger.User.Profile.CurrentFile or Dillinger.Editor.getSession().getValue())
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

    initAutoSave: ->
      if Dillinger.User.Profile.AutoSave.enabled is true
        Dillinger.User.Profile.AutoSave.fn = setInterval ->
          Dillinger.FileHandler.saveFile()
        , Dillinger.User.Profile.AutoSave.interval
      else
        clearInterval Dillinger.Profile.AutoSave.fn
      return

    setCurrentFilenameField: (str) ->
      Dillinger.$documentName.text(str or Dillinger.User.Profile.CurrentFileName or 'Empty Name')
      false

    getCurrentFilenameFromField: ->
      Dillinger.$documentName.text()

    getTextInElement: (node) ->
      return node.data if node.nodeType is 3
      txt = ""
      if node = node.firstChild
        loop
          txt += Dillinger.getTextInElement(node)
          break unless node = node.nextSibling
      txt

    refreshWordCount: (selectionCount) ->
      if Dillinger.User.Profile.WordCount is true
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
      if Dillinger.User.Profile.WordCount is true
        Dillinger.$wordcount.text()

    bindLayoutEvents: ->
      $('.menu-sidebar').on 'click', '.menu-link', ->
        $that = $(@)
        $that.parent().toggleClass('open')
        false

      $('.toggle').on 'click', ->
        $('body').toggleClass('open-menu')
        false

      Dillinger.$saveDocButton.on 'click', (e) ->
        e.preventDefault()
        Dillinger.FileHandler.saveFile()
        false

      Dillinger.$newDocButton.on 'click', (e) ->
        e.preventDefault()
        Dillinger.FileHandler.createNewDocument()
        Dillinger.refreshPreview()
        Dillinger.refreshWordCount()
        false

      Dillinger.$showPreviewButton.on 'click', (e) ->
        e.preventDefault()
        Dillinger.$showPreviewButton.toggleClass('open')
        $('body').toggleClass('show-preview')

      Dillinger.$showSettingsButton.on 'click', (e) ->
        e.preventDefault()
        Dillinger.$showSettingsButton.toggleClass('open')
        $('body').toggleClass('show-settings')
        false

      Dillinger.$documentList.on 'click', 'a', (e) ->
        e.preventDefault()
        filename = $(@).data('document-name')
        Dillinger.FileHandler.loadFile(filename)
        false

      Dillinger.$deleteDocButton.on 'click', (e) ->
        e.preventDefault()
        Dillinger.FileHandler.deleteFile()
        false

      Dillinger.switches.forEach (el) ->
        switchery = new Switchery(el, color: "#35D7BB")

      return


  module.exports = Dillinger
