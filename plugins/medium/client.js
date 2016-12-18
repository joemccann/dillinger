// Medium Module
var Medium = (function() {

  // Sorting regardless of upper/lowercase
  // TODO: Let's be DRY and merge this with the
  // sort method in Github module.
  function _alphaNumSort(m,n) {
    var a = m.path.toLowerCase()
    var b = n.path.toLowerCase()
    if (a === b) { return 0 }
    if (isNaN(m) || isNaN(n)) { return (a > b ? 1 : -1) }
    else { return m-n }
  }


  return {
    fetchAccountInfo: function() {

      function _beforeSendHandler() {
        Notifier.showMessage('Fetching User Info from Medium')
      }

      function _doneHandler(a, b, response) {
        var resp = JSON.parse(response.responseText)
        // console.log('\nFetch User Info...')
        // console.dir(resp)
        Notifier
          .showMessage('Sup '+ resp.display_name)
      } // end done handler

      function _failHandler() {
        alert("Roh-roh. Something went wrong. :(")
      }

      var config = {
        type: 'GET'
      , dataType: 'json'
      , url: '/account/medium'
      , beforeSend: _beforeSendHandler
      , error: _failHandler
      , success: _doneHandler
      }

      $.ajax(config)

    }, // end fetchAccuntInfo()
    fetchMetadata: function() {

      function _beforeSendHandler() {
        Notifier.showMessage('Fetching Metadata')
      }

      function _doneHandler(a, b, response) {
        var resp = JSON.parse(response.responseText)
        window.console && window.console.log && console.dir(resp)
      } // end done handler

      function _failHandler() {
        alert("Roh-roh. Something went wrong. :(")
      }

      var config = {
        type: 'GET'
      , dataType: 'json'
      , url: '/medium/metadata'
      , beforeSend: _beforeSendHandler
      , error: _failHandler
      , success: _doneHandler
      }

      $.ajax(config)

    }, // end fetchMetadata()
    fetchMarkdownFile: function(filename) {

      function _doneHandler(a, b, response) {
        response = JSON.parse(response.responseText)
        // console.dir(response)
        if( response.statusCode === 404 ) {

          var msg = JSON.parse( response.data )

          Notifier.showMessage(msg.error)

        }
        else{

          $('#modal-generic').modal('hide')

          // Update it in localStorage
          updateFilename(profile.current_filename)
          // Show it in the field
          setCurrentFilenameField()

          editor.getSession().setValue( response.data )
          previewMd()
          Github.clear();

        } // end else
      } // end done handler

      function _failHandler() {
        alert("Roh-roh. Something went wrong. :(")
      }

      // Weird encoding mumbo jumbo columbo
      var enc = _encodeFilename(filename)
      var path = _removeFilenameFromPath(filename)

      filename = path + enc

      var config = {
        type: 'POST'
      , dataType: 'json'
      , data: 'mdFile=' + filename
      , url: '/fetch/medium'
      , error: _failHandler
      , success: _doneHandler
      }

      $.ajax(config)

    }, // end fetchMarkdownFile()
    setFilePath: function(path) {
      path = _removeFilenameFromPath(path)
      updateUserProfile({medium: {filepath: path }})
    },
    putMarkdownFile: function() {

      function _doneHandler(a, b, response) {
        a = b = null
        response = JSON.parse(response.responseText)
        // console.dir(response)
        if( response.statusCode >= 204 ) {

          var msg = JSON.parse( response.data )

          Notifier.showMessage(msg.error, 5000)

        }
        else{

          $('#modal-generic').modal('hide')

          Notifier.showMessage(Notifier.messages.docSavedMedium)

        } // end else
      } // end done handler

      function _failHandler() {
        alert("Roh-roh. Something went wrong. :(")
      }

      var content = encodeURIComponent(editor.getSession().getValue())

      var hasExtension = _isFileExt(profile.current_filename)

      var postData = 'pathToMdFile=' + profile.medium.filepath + encodeURIComponent(profile.current_filename)
        + (hasExtension ? '' : editorType().fileExts[0])
        + '&fileContents='
        + content

      var config = {
        type: 'POST'
      , dataType: 'json'
      , data: postData
      , url: '/save/medium'
      , error: _failHandler
      , success: _doneHandler
      }

      $.ajax(config)

    },
    bindNav: function() {
      $("#save_medium")
        .on('click', function() {
          profile.current_filename = profile.current_filename || '/Dillinger/' + generateRandomFilename('md')

          Medium.putMarkdownFile()
          saveFile()

          return false
        })

      $('#import_medium')
        .on('click', function() {
          Medium.searchMedium()
          return false
        })

    }
  } // end return obj
})() // end IIFE

Plugins.register(Medium)
