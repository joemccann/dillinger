// Notification Module
var Notifier = (function() {

  var _el = $('#notify')
  return {
    messages: {
      profileUpdated: "Profile updated"
      , profileCleared: "Profile cleared"
      , docSavedLocal: "Document saved locally"
      , docDeletedLocal: "Document deleted from local storage"
      , docSavedServer: "Document saved on our server"
      , docSavedDropbox: "Document saved on Dropbox"
      , docSavedGithub: "Document saved on Github"
      , dropboxImportNeeded: "Please import a file from Dropbox first."
    },
    showMessage: function(msg,delay) {

      // TODO: FIX ANIMATION QUEUE PROBLEM - .stop() doesn't work.

      _el
        .text('')
        .stop()
        .text(msg)
        .slideDown(250, function() {
          _el
            .delay(delay || 1000)
            .slideUp(250)
        })

      } // end showMessage
  } // end return obj
})() // end IIFE
