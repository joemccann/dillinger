
alphaNumSort = require("./utils").alphaNumSort
templates    =
  documents: require("../templates/documents")

do ($ = jQuery, window, document) ->

  _createListHTML = (files) ->
    console.log files
    documents = []
    # Sort alpha
    files.sort alphaNumSort
    files.forEach (name) ->
      documents.push title: name
      return
    templates.documents(docs: documents)

  FileHandler =

    createNewDocument: ->
      Dillinger.setCurrentFilenameField("Untitled Document #{Math.floor(Math.random() * 10) + 1}")
      Dillinger.Editor.getSession().setValue "# Untitled Document"
      Dillinger.refreshPreview()
      @saveFile()
      return

    showFilesInSidebar: ->
      fileList = Object.keys(Dillinger.User.Profile.Files)
      if fileList.length >= 1
        html = _createListHTML(fileList)
        Dillinger.$documentList.html(html)
        return true
      false

    loadFile: (fileName) ->
      Dillinger.Editor.getSession().setValue(Dillinger.User.Profile.Files[fileName])
      Dillinger.setCurrentFilenameField(fileName)
      Dillinger.User.updateProfile()

      # TODO:
      # Allow Github to unload it's current file if another file
      # gets loaded without touching these Dropbox/GoogleDrive objects.
      # This is to prevent a file not loaded from Github
      # from overwriting your file.
      # Github.clear()
      return

    saveFile: ->
      filename = Dillinger.getCurrentFilenameFromField()
      markdown = Dillinger.Editor.getSession().getValue()

      Dillinger.User.Profile.Files[filename] = markdown
      Dillinger.User.updateProfile()
      @showFilesInSidebar()
      # Notifier.showMessage Notifier.messages.docSavedLocal  if (typeof showNotice isnt "object") or showNotice.show isnt false
      return

    deleteFile: ->
      filename = Dillinger.User.Profile.CurrentFileName
      delete Dillinger.User.Profile.Files[filename]
      Dillinger.User.updateProfile()
      @showFilesInSidebar()
      return

  module.exports = FileHandler
