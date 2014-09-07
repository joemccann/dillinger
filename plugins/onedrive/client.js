var OneDrive = (function() {
  function _errorHandler(a, b, res) {
    Notifier.showMessage(res.responseText);
  }

  function renderSearchResults(a, b, res) {
    var result = JSON.parse(res.responseText)
      , list = '<ul>'

    // Handle empty array case.
    if (!Array.isArray(result.data)) return _errorHandler(null, null, { responseText: "No Markdown files found!" })

    result.data.forEach(function(item) {
      list += '<li data-file-id="'
            + item.id + '"><a class="onedrive_file" href="#">'
            + item.name + '</a></li>'
    })

    list += '</ul>'
    $('.modal-header h3').text('Your OneDrive Files')
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
    // gets loaded without touching these Dropbox/GoogleDrive/OneDrive objects.

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
        url: '/import/onedrive',
        beforeSend: function() {
          console.log(Notifier)
          Notifier.showMessage('Searching for .' + editorType().name + ' (' + editorType().fileExts.join(', ') + ') files')
        },
        error: _errorHandler,
        success: renderSearchResults
      });
    },
    get: function(cb) {
      $.ajax({
        dataType: 'json',
        url: '/fetch/onedrive?fileId=' + this.fileId,
        error: _errorHandler,
        success: function(a, b, res) {
          renderFile(a, b, res);
          cb();
        }
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
        url: '/save/onedrive?fileId=' + (GoogleDrive.fileId || ''),
        error: _errorHandler,
        success: function(a, b, res) {
          var response = JSON.parse(res.responseText);
          if (response.id) {
            GoogleDrive.fileId = response.id
            Notifier.showMessage('Document saved on OneDrive')
          } else {
            Notifier.showMessage('An error occurred!')
          }
        }
      });
    },
    bindNav: function() {
      $('#import_onedrive')
        .on('click', function() {
          OneDrive.search();
          return false;
        })

      $("#save_onedrive")
        .on('click', function() {
          //profile.current_filename = profile.current_filename || generateRandomFilename('md')
          OneDrive.save();
          saveFile();
        })
    }
  }
})();

Plugins.register(OneDrive)
