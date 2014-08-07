// Dropbox Module
var Dropbox = (function() {

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

  function _listMdFiles(files) {

    var list = '<ul>'

    // Sort alpha
    files.sort(_alphaNumSort)

    files.forEach(function(item) {
      // var name = item.path.split('/').pop()
      list += '<li data-file-path="'
            + item.path + '"><a class="dropbox_file" href="#">'
            + item.path + '</a></li>'
    })

    list += '</ul>'

    $('.modal-header h3').text('Your Dropbox Files')

    $('.modal-body').html(list)

    $('#modal-generic').modal({
      keyboard: true,
      backdrop: true,
      show: true
    })

    return false

  }

  function _encodeFilename(path) {
    return encodeURIComponent( path.split('/').pop() )
  }

  function _removeFilenameFromPath(path) {
    // capture the name
    var name = path.split('/').pop()
    // then just replace with nothing on the path. boom.
    return path.replace(name, '')
  }

  return {
    fetchAccountInfo: function() {

      function _beforeSendHandler() {
        Notifier.showMessage('Fetching User Info from Dropbox')
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
      , url: '/account/dropbox'
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
      , url: '/dropbox/metadata'
      , beforeSend: _beforeSendHandler
      , error: _failHandler
      , success: _doneHandler
      }

      $.ajax(config)

    }, // end fetchMetadata()
    searchDropbox: function() {

      function _beforeSendHandler() {
        Notifier.showMessage('Searching for  .' + editorType().name + ' (' + editorType().fileExts.join(', ') + ') files')
      }

      function _doneHandler(a, b, response) {

        a = b = null

        var resp = JSON.parse(response.responseText)

        if(resp.hasOwnProperty('statusCode') && resp.statusCode === 401) {
          // {"statusCode":401,"data":"{\"error\": \"Access token is disabled.\"}"}

          var respData = JSON.parse(resp.data)

          Notifier.showMessage('Error! ' + respData.error, 1000)

          return setTimeout(function() {
            Notifier.showMessage('Reloading!')
            window.location.reload()
          }, 1250)

        }

        if(!resp.length) {
          Notifier.showMessage('No .' + editorType().name + ' (' + editorType().fileExts.join(', ') + ') files found!')
        }
        else{
          // console.dir(resp)
          _listMdFiles(resp)
        }
      } // end done handler

      function _failHandler(resp,err) {
        alert(resp.responseText || "Roh-roh. Something went wrong. :(")
      }

      // when passing file extensions, use pipe as it is not a valid filename character
      var config = {
        type: 'POST',
        dataType: 'json',
        data: 'fileExts=' + editorType().fileExts.join('|'),
        url: '/import/dropbox',
        beforeSend: _beforeSendHandler,
        error: _failHandler,
        success: _doneHandler
      }

      $.ajax(config)

    }, // end searchDropbox()
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
      , url: '/fetch/dropbox'
      , error: _failHandler
      , success: _doneHandler
      }

      $.ajax(config)

    }, // end fetchMarkdownFile()
    setFilePath: function(path) {
      path = _removeFilenameFromPath(path)
      updateUserProfile({dropbox: {filepath: path }})
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

          Notifier.showMessage(Notifier.messages.docSavedDropbox)

        } // end else
      } // end done handler

      function _failHandler() {
        alert("Roh-roh. Something went wrong. :(")
      }

      var content = encodeURIComponent(editor.getSession().getValue())

      var hasExtension = _isFileExt(profile.current_filename)

      var postData = 'pathToMdFile=' + profile.dropbox.filepath + encodeURIComponent(profile.current_filename)
        + (hasExtension ? '' : editorType().fileExts[0])
        + '&fileContents='
        + content

      var config = {
        type: 'POST'
      , dataType: 'json'
      , data: postData
      , url: '/save/dropbox'
      , error: _failHandler
      , success: _doneHandler
      }

      $.ajax(config)

    },
    bindNav: function() {
      $("#save_dropbox")
        .on('click', function() {
          profile.current_filename = profile.current_filename || '/Dillinger/' + generateRandomFilename('md')

          Dropbox.putMarkdownFile()
          saveFile()

          return false
        })

      $('#import_dropbox')
        .on('click', function() {
          Dropbox.searchDropbox()
          return false
        })

    }
  } // end return obj
})() // end IIFE

Plugins.register(Dropbox)
