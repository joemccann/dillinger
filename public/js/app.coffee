"use strict"

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
  Elements:
    $preview: $("#preview")
    $editor: $("#editor")
    $documentname: $("#document-name")

$ ->

  $(".menu-sidebar").on "click", ".menu-item", ->
    $that = $(@)
    $that.toggleClass('open')

  $(".toggle").on "click", ->
    $("body").toggleClass("open-menu")

  initDillinger = ->
    Dillinger.Editor = ace.edit('editor')
    # Dillinger.Editor.setTheme("ace/theme/monokai");
    Dillinger.Editor.getSession().setMode("ace/mode/markdown");

  # initDillinger()

