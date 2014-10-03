
$            = require 'jquery'
alphaNumSort = require("./utils").alphaNumSort
templates    =
  documents: require("../templates/documents")

_listMdFiles = (files) ->
  documents = []
  # Sort alpha
  files.sort alphaNumSort
  files.forEach (name) ->
    documents.push title: name
    return
  templates.documents(docs: documents)

LocalFiles =


  createNewDocument: ($title, editor) ->
    $title.text "Untitled Document #{new Date().toDateString()}"
    editor.getSession().setValue "# Untitled Document"
    return

  getList: ->
    fileList = Object.keys(Dillinger.Profile.local_files)
    if fileList.length
      return _listMdFiles fileList
    return

  load: (fileName) ->
    # updateFilename fileName
    # setCurrentFilenameField()
    editor.getSession().setValue profile.local_files[fileName]
    previewMd()

    # TODO:
    # Allow Github to unload it's current file if another file
    # gets loaded without touching these Dropbox/GoogleDrive objects.

    # This is to prevent a file not loaded from Github
    # from overwriting your file.
    Github.clear()
    return

  save: (filename, markdown) ->
    Dillinger.Profile.local_files[filename] = markdown
    # updateUserProfile saveObj
    # Notifier.showMessage Notifier.messages.docSavedLocal  if (typeof showNotice isnt "object") or showNotice.show isnt false
    return

  delete: (fileName) ->
    files = Dillinger.Profile.local_files
    delete Dillinger.Profile.local_files[fileName]
    return

module.exports = LocalFiles
