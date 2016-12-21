var Medium = (function() {

  function _errorHandler(a, b, res) {
    Notifier.showMessage(res.responseText);
  }

  // TODO: what to do if access token expires?
  return {
    fileId: null,
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
        url: '/save/medium?fileId=' + (Medium.fileId || ''),
        error: _errorHandler,
        success: function(a, b, res) {
          var response = JSON.parse(res.responseText);

          console.dir(res)

          if (response.id) {
            Medium.fileId = response.id
            Notifier.showMessage('Document saved on Medium')
          } else {
            Notifier.showMessage('An error occurred!')
          }
        }
      });
    },
    bindNav: function() {
      $("#save_medium")
        .on('click', function() {
          //profile.current_filename = profile.current_filename || generateRandomFilename('md')
          Medium.save()
          saveFile()
        })
    }
  }
})();

Plugins.register(Medium)
