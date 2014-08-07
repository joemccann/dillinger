var GoogleDrive = (function() {

  function _errorHandler(a, b, res) {
    Notifier.showMessage(res.responseText);
  }

  function renderSearchResults(a, b, res) {

    var result = JSON.parse(res.responseText)
      , list = '<ul>'

    // Handle empty array case.
    if (!Array.isArray(result.items)) return _errorHandler(null, null, { responseText: "No Markdown files found!" })

    result.items.forEach(function(item) {
      list += '<li data-file-id="'
            + item.id + '"><a class="googledrive_file" href="#">'
            + item.title + '</a></li>'
    })

    list += '</ul>'
    $('.modal-header h3').text('Your Google Drive Files')
    $('.modal-body').html(list)
    $('#modal-generic').modal({
      keyboard: true
    , backdrop: true
    , show: true
    })
  }

  function renderFile(a, b, res) {
    var result = JSON.parse(res.responseText);
    $('#modal-generic').modal('hide');
    editor.getSession().setValue(result.content);
    previewMd();

    // TODO:
    // Allow Github to unload it's current file if another file
    // gets loaded without touching these Dropbox/GoogleDrive objects.

    // This is to prevent a file not loaded from Github
    // from overwriting your file.

    Github.clear();
  }

  // TODO: what to do if access token expires?
  return {
    fileId: null,
    search: function() {
      $.ajax({
        dataType: 'json',
        url: '/import/googledrive',
        beforeSend: function() {
          console.log(Notifier)
          Notifier.showMessage('Searching for .' + editorType().name + ' (' + editorType().fileExts.join(', ') + ') files')
        },
        error: _errorHandler,
        success: renderSearchResults
      });
    },
    get: function() {
      $.ajax({
        dataType: 'json',
        url: '/fetch/googledrive?fileId=' + this.fileId,
        error: _errorHandler,
        success: renderFile
      });
    },
    save: function() {
      var content = encodeURIComponent(editor.getSession().getValue());
      // https://github.com/joemccann/dillinger/issues/90
      // If filename contains .md or .markdown as extension...
      var hasExtension = _isFileExt(profile.current_filename)

      var postData = 'title=' + encodeURIComponent(profile.current_filename)
        + (hasExtension ? '' : editorType().fileExts[0])
        + '&content='
        + content

      $.ajax({
        dataType: 'json',
        type: 'post',
        data: postData,
        url: '/save/googledrive?fileId=' + (GoogleDrive.fileId || ''),
        error: _errorHandler,
        success: function(a, b, res) {
          var response = JSON.parse(res.responseText);
          if (response.id) {
            GoogleDrive.fileId = response.id
            Notifier.showMessage('Document saved on Google Drive')
          } else {
            Notifier.showMessage('An error occurred!')
          }
        }
      });
    },
    bindNav: function() {
      $('#import_googledrive')
        .on('click', function() {
          GoogleDrive.search()
          return false
        })

      $("#save_googledrive")
        .on('click', function() {
          //profile.current_filename = profile.current_filename || generateRandomFilename('md')
          GoogleDrive.save()
          saveFile()

        })

    }
  }
})();

Plugins.register(GoogleDrive)
