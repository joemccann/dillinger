
  var editor
    , converter
    , autoInterval
    , githubUser
    , paperImgPath = '/img/notebook_paper_200x200.gif'
    , profile = {
        theme: 'ace/theme/idle_fingers'
      , showPaper: false
      , currentFile: ''
      , autosave: {
          enabled: true
        , interval: 3000 // might be too aggressive; don't want to block UI for large saves.
        }
      , wordcount: true
      , current_filename: 'Untitled Document'
      , github: {
          current_uri: ''
        , opts: {}
        }
      , dropbox: {
          filepath: '/Dillinger/'
        }
      , local_files: { "Untitled Document": "" }
      , editing: 'markdown-gfm'
      , editors: {
        'markdown-gfm': { type: 'markdown-gfm', name: 'Github Markdown', fileExts: ['.md', '.markdown', '.mdown'] }
      , 'markdown': { type: 'markdown', name: 'Markdown', fileExts: ['.md', '.markdown', '.mdown'] }
      , 'html': { type: 'html', name: 'HTML', fileExts: ['.html', '.htm'] }
      }
    }

  // Feature detect ish
  var dillinger = 'dillinger'
    , dillingerElem = document.createElement(dillinger)
    , dillingerStyle = dillingerElem.style
    , domPrefixes = 'Webkit Moz O ms Khtml'.split(' ')

  // Cache some shit
  var $theme = $('#theme-list')
    , $preview = $('#preview')
    , $autosave = $('#autosave')
    , $wordcount = $('#wordcount')
    , $wordcounter = $('#wordcounter')
    , $filename = $('#filename')


  // Hash of themes and their respective background colors
  var bgColors = {
    'chrome': '#bbbbbb'
  , 'clouds': '#7AC9E3'
  , 'clouds_midnight': '#5F9EA0'
  , 'cobalt': '#4d586b'
  , 'crimson_editor': '#ffffff'
  , 'dawn': '#DADCAD'
  , 'eclipse': '#6C7B8A'
  , 'idle_fingers': '#DEB887'
  , 'kr_theme': '#434343'
  , 'merbivore': '#3E353E'
  , 'merbivore_soft': '#565156'
  , 'mono_industrial': '#C0C0C0'
  , 'monokai': '#F5DEB3'
  , 'pastel_on_dark': '#676565'
  , 'solarized-dark': '#0E4B5A'
  , 'solarized_light': '#dfcb96'
  , 'textmate': '#fff'
  , 'tomorrow': '#0e9211'
  , 'tomorrow_night': '#333536'
  , 'tomorrow_night_blue': '#3a4150'
  , 'tomorrow_night_bright': '#3A3A3A'
  , 'tomorrow_night_eighties': '#474646'
  , 'twilight': '#534746'
  , 'vibrant_ink': '#363636'
  }

  function editorType() {
    return profile.editors[profile.editing]
  }

  function arrayToRegExp(arr) {
    return new RegExp('(' + arr.map(function(e) { return e.replace('.','\\.') }).join('|') + ')$', 'i')
  }

  // Test for file extension
  function _isFileExt(file) {
    return arrayToRegExp(editorType().fileExts).test(file)
  }

  /// UTILS =================

  /**
   * Utility method to async load a JavaScript file.
   *
   * @param {String} The name of the file to load
   * @param {Function} Optional callback to be executed after the script loads.
   * @return {void}
   */
  function asyncLoad(filename, cb) {
    (function(d, t) {

      var leScript = d.createElement(t)
        , scripts = d.getElementsByTagName(t)[0]

      leScript.async = 1
      leScript.src = filename
      scripts.parentNode.insertBefore(leScript, scripts)

      leScript.onload = function() {
        cb && cb()
      }

    }(document, 'script'))
  }

  /**
   * Utility method to determin if localStorage is supported or not.
   *
   * @return {Boolean}
   */
  function hasLocalStorage() {
    // http://mathiasbynens.be/notes/localstorage-pattern
    var storage
    try { if (localStorage.getItem) { storage = localStorage } } catch(e) {}
    return storage
  }

  /**
   * Grab the user's profile from localStorage and stash in "profile" variable.
   *
   * @return {Void}
   */
  function getUserProfile() {
    var p
    try {
      p = JSON.parse(localStorage.profile)
      // Need to merge in any undefined/new properties from last release
      // Meaning, if we add new features they may not have them in profile
      p = $.extend(true, profile, p)
    } catch(e) {
      p = profile
    }

    profile = p

  }

  /**
   * Update user's profile in localStorage by merging in current profile with passed in param.
   *
   * @param {Object}  An object containg proper keys and values to be JSON.stringify'd
   * @return {Void}
   */
  function updateUserProfile(obj) {
    localStorage.clear()
    localStorage.profile = JSON.stringify($.extend(true, profile, obj))
  }

  /**
   * Utility method to test if particular property is supported by the browser or not.
   * Completely ripped from Modernizr with some mods.
   * Thx, Modernizr team!
   *
   * @param {String}  The property to test
   * @return {Boolean}
   */
  function prefixed(prop) { return testPropsAll(prop, 'pfx') }

  /**
   * A generic CSS / DOM property test; if a browser supports
   * a certain property, it won't return undefined for it.
   * A supported CSS property returns empty string when its not yet set.
   *
   * @param  {Object}  A hash of properties to test
   * @param  {String}  A prefix
   * @return {Boolean}
   */
  function testProps(props, prefixed) {
    for (var i in props) {
      if (dillingerStyle[props[i]] !== undefined) {
        return prefixed === 'pfx' ? props[i] : true
      }
    }
    return false
  }

  /**
   * Tests a list of DOM properties we want to check against.
   * We specify literally ALL possible (known and/or likely) properties on
   * the element including the non-vendor prefixed one, for forward-
   * compatibility.
   *
   * @param  {String}  The name of the property
   * @param  {String}  The prefix string
   * @return {Boolean}
   */
  function testPropsAll(prop, prefixed) {

      var ucProp = prop.charAt(0).toUpperCase() + prop.substr(1)
        , props = (prop + ' ' + domPrefixes.join(ucProp + ' ') + ucProp).split(' ')

      return testProps(props, prefixed)
  }

  /**
   * Normalize the transitionEnd event across browsers.
   *
   * @return {String}
   */
  function normalizeTransitionEnd() {

    var transEndEventNames = {
      'WebkitTransition' : 'webkitTransitionEnd'
    , 'MozTransition'    : 'transitionend'
    , 'OTransition'      : 'oTransitionEnd'
    , 'msTransition'     : 'msTransitionEnd' // maybe?
    , 'transition'       : 'transitionend'
    }

    return transEndEventNames[prefixed('transition')]
  }


  /**
   * Generate a random filename.
   *
   * @param  {String}  The file type's extension
   * @return {String}
   */
  function generateRandomFilename(ext) {
    return 'dillinger_' + (new Date()).toISOString().replace(/[\.:-]/g, "_") + '.' + ext
  }


  /**
   * Get current filename from contenteditable field.
   *
   * @return {String}
   */
  function getCurrentFilenameFromField() {
    return $('#filename > span[contenteditable="true"]').text()
  }


  /**
   * Set current filename from profile.
   *
   * @param {String}  Optional string to force set the value.
   * @return {String}
   */
  function setCurrentFilenameField(str) {
    $('#filename > span[contenteditable="true"]').text(str || profile.current_filename || "Untitled Document")
  }

  /**
   * Returns the full text of an element and all its children.
   * The script recursively traverses all text nodes, and returns a
   * concatenated string of all texts.
   *
   * Taken from
   * http://stackoverflow.com/questions/2653670/innertext-textcontent-vs-retrieving-each-text-node
   *
   * @param node
   * @return {int}
   */
  function getTextInElement(node) {
    if (node.nodeType === 3) {
      return node.data;
    }

    var txt = '';

    if (node = node.firstChild) do {
      txt += getTextInElement(node);
    } while (node = node.nextSibling);

    return txt;
  }

  /**
   * Counts the words in a string
   *
   * @param string
   * @return int
   */
  function countWords(string) {
    var words = string.replace(/W+/g, ' ').match(/\S+/g);
    return words && words.length || 0;
  }


  /**
   * Initialize application.
   *
   * @return {Void}
   */
  function init() {

    if (!hasLocalStorage()) { sadPanda() }
    else {

      // Attach to jQuery support object for later use.
      $.support.transitionEnd = normalizeTransitionEnd()

      getUserProfile()

      initAce()

      initEditorType()

      initUi()

      marked.setOptions({
        gfm: true
      , tables: true
      , pedantic: false
      , sanitize: true
      , smartLists: true
      , smartypants: false
      , langPrefix: 'lang-'
      , highlight: function (code) {
          return hljs.highlightAuto(code).value;
        }
      })

      bindPreview()

      bindNav()

      bindKeyboard()

      bindDelegation()

      bindFilenameField()

      bindWordCountEvents();

      autoSave()

      initWordCount()

      refreshWordCount()

    }

  }

  /**
   * Initialize theme and other options of Ace editor.
   *
   * @return {Void}
   */
  function initAce() {

    editor = ace.edit("editor")

  } // end initAce

  function initEditorType() {
    if ($('#editor-dropdown li').length === 0) {
      var list = ""
        , eds = Object.keys(profile.editors)

      eds.forEach(function(type) {
        var editor = profile.editors[type]
        list += '<li><a href="#" data-value="' + type + '">' + editor.name + '</a></li>'
      })

      $('#editor-dropdown').find('li').remove().end().append(list)
    }
    if (editorType().type.substring(0, 8) == "markdown") {
      marked.setOptions({
        gfm: (editorType().type === "markdown-gfm" ? true : false)
      , tables: true
      , pedantic: false
      , sanitize: false
      , smartLists: true
      , smartypants: false
      , langPrefix: 'lang-'
      , highlight: function (code, lang, etc) {
          if (hljs.getLanguage(lang)) {
            code = hljs.highlight(lang, code).value;
          }
          return code;
        }
      })
      converter = marked
      editor.getSession().setMode('ace/mode/markdown')

    }
    else { // html
      converter = function(input) {
        var htmlEle = document.createElement("div")

        htmlEle.innerHTML = input;

        return htmlEle.innerHTML.replace(/(?:^\s*|\s*$)/g, '');
      }
      editor.getSession().setMode('ace/mode/html')
    }

    $("#editor-selector a.dropdown-toggle")
      .text(editorType().name)
      .append("<b class='caret'></b>")

  }
  /**
   * Initialize various UI elements based on userprofile data.
   *
   * @return {Void}
   */
  function initUi() {

    // Set proper theme value in theme dropdown
    fetchTheme(profile.theme, function() {
      $theme.find('li > a[data-value="'+profile.theme+'"]').addClass('selected')

      editor.getSession().setUseWrapMode(true)
      editor.setShowPrintMargin(false)

      editor.getSession().setValue(profile.currentFile || editor.getSession().getValue())

      // Immediately populate the preview <div>
      previewMd()

    })

    // Set/unset paper background image on preview
    // TODO: FIX THIS BUG
    $preview.css('backgroundImage', profile.showPaper ? 'url("'+paperImgPath+'")' : 'url("")' )

    // Set text for dis/enable autosave / word counter
    $autosave.html(profile.autosave.enabled ? '<i class="icon-ok"></i>&nbsp;Autosave is Enabled' : '<i class="icon-remove"></i>&nbsp;Autosave is Disabled')
    $wordcount.html(profile.wordcount ? '<i class="icon-ok"></i>&nbsp;Word Count is Enabled' : '<i class="icon-remove"></i>&nbsp;Word Count is Disabled')

    // Check for logged in Github user and notifiy
    githubUser = $('#import_github').attr('data-github-username')

    githubUser && Notifier.showMessage("What's Up " + githubUser, 1000)

    setCurrentFilenameField()

    /* BEGIN RE-ARCH STUFF */

    $('.dropdown-toggle').dropdown()

    /* END RE-ARCH STUFF */

  }


  /// HANDLERS =================


  /**
   * Clear the markdown and text and the subsequent HTML preview.
   *
   * @return {Void}
   */
  function clearSelection() {
    editor.getSession().setValue("")
    previewMd()
  }

  // TODO: WEBSOCKET MESSAGE?
  /**
   * Save the markdown via localStorage - eventType.manual is from a click or key event.
   *
   * @param {Object}
   * @return {Void}
   */
  function saveFile(eventType) {

    updateUserProfile({ currentFile: editor.getSession().getValue() })

    if((typeof eventType === 'object') && eventType.manual === true) {
      Notifier.showMessage(Notifier.messages.docSavedLocal)
    }
  }

  /**
   * Enable autosave for a specific interval.
   *
   * @return {Void}
   */
  function autoSave() {

    if (profile.autosave.enabled) {
      autoInterval = setInterval(function() {
        // firefox barfs if I don't pass in anon func to setTimeout.
        saveFile()
        LocalFiles.saveFile({ show: false })
      }, profile.autosave.interval)

    }
    else {
      clearInterval(autoInterval)
    }

  }

  /**
   * Clear out user profile data in localStorage.
   *
   * @return {Void}
   */
  function resetProfile() {
    // For some reason, clear() is not working in Chrome.
    localStorage.clear()
    // Let's turn off autosave
    profile.autosave.enabled = false
    // Delete the property altogether --> need ; for JSHint bug.
    ; delete localStorage.profile
    // Now reload the page to start fresh
    window.location.reload()
    // Notifier.showMessage(Notifier.messages.profileCleared, 1400)
  }

  /**
   * Dropbown nav handler to update the current theme.
   *
   * @return {Void}
   */
   function changeTheme(e) {
     // check for same theme
     var $target = $(e.target)
     if ($target.attr('data-value') === profile.theme) { return }
     else {
      // add/remove class
      $theme.find('li > a.selected').removeClass('selected')
      $target.addClass('selected')
      // grabnew theme
      var newTheme = $target.attr('data-value')

      $(e.target).blur()

      fetchTheme(newTheme, function() {
        Notifier.showMessage(Notifier.messages.profileUpdated)
      })
    }
  }

  // TODO: Maybe we just load them all once and stash in appcache?
  /**
   * Dynamically appends a script tag with the proper theme and then applies that theme.
   *
   * @param {String}  The theme name
   * @param {Function}   Optional callback
   * @return {Void}
   */
  function fetchTheme(th, cb) {
    var name = th.split('/').pop()

    asyncLoad("/js/theme-"+ name +".js", function() {

      editor.setTheme(th)

      cb && cb()

      updateBg(name)

      updateUserProfile({theme: th})

    }) // end asyncLoad

  } // end fetchTheme(t)

  /**
   * Change the body background color based on theme.
   *
   * @param {String}  The theme name
   * @return {Void}
   */
  function updateBg(name) {
    document.body.style.backgroundColor = bgColors[name]
  }

  /**
   * Clientside update showing rendered HTML of Markdown.
   *
   * @return {Void}
   */
  function previewMd() {

    var unmd = editor.getSession().getValue()
      , md = converter(unmd)

    if (editorType().type === 'html') {
      $preview.html('')
      $('<iframe>').appendTo($preview).contents().find('body').html(md)
    }
    else {
      $preview
        .html('') // unnecessary?
        .html(md)
    }

    refreshWordCount();
  }

  function refreshWordCount(selectionCount) {
    var msg = "Words: ";
    if (selectionCount !== undefined) {
      msg += selectionCount + " of ";
    }
    if(profile.wordcount) {
      $wordcounter.text(msg + countWords(getTextInElement($preview[0])));
    }
  }

  /**
   * Stash current file name in the user's profile.
   *
   * @param {String}  Optional string to force the value
   * @return {Void}
   */
  function updateFilename(str) {
    // Check for string because it may be keyup event object
    var f
    if (typeof str === 'string') {
      f = str
    }
    else {
      f = getCurrentFilenameFromField()
    }
    updateUserProfile({ current_filename: f })
  }

  /**
   * XHR Post Markdown to get a md file.  Appends response to hidden iframe to
   * automatically download the file.
   *
   * @return {Void}
   */
  function fetchMarkdownFile() {

    var unmd = editor.getSession().getValue()

    function _doneHandler(a, b, response) {
      a = b = null // JSHint complains if a, b are null in method
      var resp = JSON.parse(response.responseText)
      // console.dir(resp)
      document.getElementById('downloader').src = '/files/md/' + resp.data
    }

    function _failHandler() {
      alert("Roh-roh. Something went wrong. :(")
    }

    var mdConfig = {
      type: 'POST'
    , data: 'name=' + encodeURIComponent(getCurrentFilenameFromField()) + "&unmd=" + encodeURIComponent(unmd)
    , dataType: 'json'
    , url: '/factory/fetch_markdown'
    , error: _failHandler
    , success: _doneHandler
    }

    $.ajax(mdConfig)

  }

  /**
   * XHR Post Markdown to get a html file.  Appends response to hidden iframe to
   * automatically download the file.
   *
   * @return {Void}
   */
  function fetchHtmlFile( formatting ) {

    var unmd = editor.getSession().getValue()

    function _doneHandler(jqXHR, data, response) {
      // console.dir(resp)
      var resp = JSON.parse(response.responseText)
      document.getElementById('downloader').src = '/files/html/' + resp.data
    }

    function _failHandler() {
      alert("Roh-roh. Something went wrong. :(")
    }

    var config = {
      type: 'POST'
    , data: 'name=' + encodeURIComponent(getCurrentFilenameFromField()) + "&unmd=" + encodeURIComponent(unmd) + ( ( formatting ) ? "&formatting=true" : "" )
    , dataType: 'json'
    , url: '/factory/fetch_html'
    , error: _failHandler
    , success: _doneHandler
    }

    $.ajax(config)

  }

  function fetchPdfFile() {

    var unmd = editor.getSession().getValue()

    function _doneHandler(jqXHR, data, response) {
      var resp = JSON.parse(response.responseText)
      document.getElementById('downloader').src = '/files/pdf/' + resp.data
    }

    function _failHandler() {
      alert("Roh-roh. Something went wrong. :(")
    }

    var config = {
      type: 'POST'
    , data: 'name=' + encodeURIComponent(getCurrentFilenameFromField()) + "&unmd=" + encodeURIComponent(unmd)
    , dataType: 'json'
    , url: '/factory/fetch_pdf'
    , error: _failHandler
    , success: _doneHandler
    }

    $.ajax(config)

  }

  function showHtml() {

    var unmd = editor.getSession().getValue()

    function _doneHandler(jqXHR, data, response) {
      var resp = JSON.parse(response.responseText)
      //var textarea = $('#modalBodyText')
      //$(textarea).val(resp.data)
      //$('#myModal').on('shown.bs.modal', function (e) {
      //  $(textarea).focus().select()
      //}).modal()

      $textarea = '<textarea id="modalBodyText">' + resp.data + '</textarea>'
      $('.modal-header h3').text('Show HTML: ' + getCurrentFilenameFromField())
      $('.modal-body').css('height', '80%').html($textarea)
      $('#modal-generic').on('shown.bs.modal', function(e) {
        $('#modalBodyText').focus().select()
      }).modal({
        keyboard: true
        , backdrop: true
        , show: true
      })

      return false
    }

    function _failHandler() {
      alert("Roh-roh. Something went wrong. :(")
    }

    var config = {
      type: 'POST'
    , data: 'name=' + encodeURIComponent(getCurrentFilenameFromField()) + "&unmd=" + encodeURIComponent(unmd)
    , dataType: 'json'
    , url: '/factory/fetch_html_direct'
    , error: _failHandler
    , success: _doneHandler
    }

    $.ajax(config)

  }

  /**
   * Show a sad panda because they are using a shitty browser.
   *
   * @return {Void}
   */
  function sadPanda() {
    // TODO: ACTUALLY SHOW A SAD PANDA.
    alert('Sad Panda - No localStorage for you!')
  }

  /**
   * Show the modal for the "About Dillinger" information.
   *
   * @return {Void}
   */
  function showAboutInfo() {

    $('.modal-header h3').text("What's the deal with Dillinger?")

    // TODO: PULL THIS OUT AND RENDER VIA TEMPLATE FROM XHR OR STASH IN PAGE FOR SEO AND CLONE
    var aboutContent =  "<p>Dillinger is an online cloud-enabled, HTML5, buzzword-filled Markdown editor.</p>"
                      + "<p>Dillinger was designed and developed by <a href='http://twitter.com/joemccann'>@joemccann</a> because he needed a decent Markdown editor.</p>"
                      + "<p>Dillinger is a 100% open source project so <a href='https://github.com/joemccann/dillinger'>fork the code</a> and contribute!</p>"
                      + "<p>Follow Dillinger on Twitter at <a href='http://twitter.com/dillingerapp'>@dillingerapp</a></p>"
                      + "<p>Follow Joe McCann on Twitter at <a href='http://twitter.com/joemccann'>@joemccann</a></p>"

    $('.modal-body').html(aboutContent)

    $('#modal-generic').modal({
      keyboard: true
    , backdrop: true
    , show: true
    })

  }

  /**
   * Show the modal for the "Preferences".
   *
   * @return {Void}
   */
  function showPreferences() {

    $('.modal-header h3').text("Preferences")

    // TODO: PULL THIS OUT AND RENDER VIA TEMPLATE FROM XHR OR STASH IN PAGE FOR SEO AND CLONE
    var prefContent =  '<div>'
                          +'<ul>'
                            +'<li><a href="#" id="paper">Toggle Paper</a></li>'
                            +'<li><a href="#" id="reset_pref">Reset Profile</a></li>'
                          +'</ul>'
                        +'</div>'

    $('.modal-body').html(prefContent)

    $('#modal-generic').modal({
      keyboard: true
    , backdrop: true
    , show: true
    })

  }


  /// UI RELATED =================

  /**
   * Toggles the paper background image.
   *
   * @return {Void}
   */
  function togglePaper() {

    $preview.css('backgroundImage', !profile.showPaper ? 'url("'+paperImgPath+'")' : 'url("")')

    updateUserProfile({ showPaper: !profile.showPaper })

    Notifier.showMessage(Notifier.messages.profileUpdated)

  }

  /**
   * Toggles the autosave feature.
   *
   * @return {Void}
   */
  function toggleAutoSave() {

    $autosave.html(profile.autosave.enabled ? '<i class="icon-remove"></i>&nbsp;Autosave is Disabled' : '<i class="icon-ok"></i>&nbsp;Autosave is Enabled')

    updateUserProfile({ autosave: { enabled: !profile.autosave.enabled } })

    autoSave()

  }

  function initWordCount() {
    if (profile.wordcount) {
      $wordcounter.removeClass('hidden');
      // Modify the width of the document name
      $filename.addClass('show-word-count-filename-adjust')
    } else {
      $wordcounter.addClass('hidden');
      // Modify the width of the document name
      $filename.removeClass('show-word-count-filename-adjust')
    }
  }

  /**
   * Toggles the wordcounter feature.
   *
   * @return {Void}
   */
  function toggleWordCount() {
    $wordcount.html(profile.wordcount ? '<i class="icon-remove"></i>&nbsp;Word Count is Disabled' : '<i class="icon-ok"></i>&nbsp;Word Count is Enabled')

    updateUserProfile({ wordcount: !profile.wordcount })

    initWordCount();

  }


  /**
   * Bind keyup handler to the editor.
   *
   * @return {Void}
   */
  function bindFilenameField() {
    $('#filename > span[contenteditable="true"]').bind('keyup', updateFilename)
  }

  /**
   * Makes the selection check fire after every mouse up event.
   *
   * @return void
   */
  function bindWordCountEvents() {
    $preview.bind('mouseup', checkForSelection);
  }

  /**
   * Checks if there is some selected text. If so, the word counter gets updated.
   *
   * @return void
   */
  function checkForSelection() {
    if (profile.wordcount) {
      var selection = window.getSelection().toString();
      if (selection !== "") {
        refreshWordCount(countWords(selection));
      } else {
        refreshWordCount();
      }
    }
  }

  /**
   * Bind keyup handler to the editor.
   *
   * @return {Void}
   */
  function bindPreview() {
    $('#editor').bind('keyup', previewMd);
  }

  /**
   * Bind navigation elements.
   *
   * @return {Void}
   */
  function bindNav() {

    $theme
      .find('li > a')
      .bind('click', function(e) {
        changeTheme(e)
        return false
      })

    $('#clear')
      .on('click', function() {
        clearSelection()
        return false
      })

    $('.modal-body')
      .on('click', '#paper', function() {
        togglePaper()
        return false
      })
      .on('click', '#reset_pref', function() {
        resetProfile();
        return false;
      })

    $("#reset")
      .on('click', function() {
        resetProfile();
        return false;
      })

    $("#autosave")
      .on('click', function() {
        toggleAutoSave()
        return false
    })

    $("#wordcount")
      .on('click', function() {
        toggleWordCount()
        return false
    })

    $('#export_md')
      .on('click', function() {
        fetchMarkdownFile()
        $('.dropdown').removeClass('open')
        return false
      })

    $('#export_html')
      .on('click', function() {
        fetchHtmlFile()
        $('.dropdown').removeClass('open')
        return false
      })

    $('#export_html_formatted')
      .on('click', function() {
        fetchHtmlFile( true )
        $('.dropdown').removeClass('open')
        return false
      })

    $('#export_pdf')
      .on('click', function() {
        fetchPdfFile()
        $('.dropdown').removeClass('open')
        return false
      })

    $('#show_html')
      .on('click', function() {
        showHtml()
        $('.dropdown').removeClass('open')
        return false
      })

    $('#preferences')
      .on('click', function() {
        showPreferences()
        return false
      })

    $('#about')
      .on('click', function() {
        showAboutInfo()
        return false
      })

    $('#cheat')
      .on('click', function() {
        window.open("https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet", "_blank")
        return false
      })

    $('#new_local_file')
      .on('click', function() {
        $('.dropdown').removeClass('open')
        LocalFiles.newFile();
        return false;
      })

    $('#import_local_file')
      .on('click', function() {
        $('.dropdown').removeClass('open')
        LocalFiles.search();
        return false;
      })

    $('#save_local_file')
      .on('click', function() {
        $('.dropdown').removeClass('open')
        LocalFiles.saveFile();
        return false;
      })

    $('#editor-dropdown')
      .on('click', 'li > a', function() {
        var pickEditor = $(this).attr("data-value")
        if (!profile.editors[pickEditor]) {
          Notifier.showMessage("Sorry, " + pickEditor + " isn't supported")
        }
        else {
          profile.editing = pickEditor
          initEditorType()
          previewMd()
        }
      })

    Plugins.forEach(function(plugin) {
      if (plugin.bindNav)
        plugin.bindNav();
    })


  } // end bindNav()

  /**
   * Bind special keyboard handlers.
   *
   * @return {Void}
   */
  function bindKeyboard() {
    // CMD+s TO SAVE DOC
    key('command+s, ctrl+s', function(e) {
      saveFile({ manual: true });
      e.preventDefault(); // so we don't save the webpage - native browser functionality
    })

    key('enter', function(e) {
      if (e.target.parentNode && e.target.parentNode.id === "filename") {
        e.preventDefault();
      }
    })

    var saveCommand = {
      name: "save",
      bindKey: {
        mac: "Command-S",
        win: "Ctrl-S"
      },
      exec: function() {
        saveFile()
        LocalFiles.saveFile()
      }
    }
    var fileForUrlNamer = {
      name: "filenamer",
      bindKey: {
        mac: "Command-Shift-M",
        win: "Ctrl-Shift-M"
      },
      exec: function() {
        var profile = JSON.parse(localStorage.profile);
        alert(profile.current_filename.replace(/\s/g, '-').toLowerCase())
      }
    }

    editor.commands.addCommand(saveCommand)
    editor.commands.addCommand(fileForUrlNamer)
  }

  /**
   * Bind dynamically added elements' handlers.
   *
   * @return {Void}
   */
  function bindDelegation() {
    $(document)
      .on('click', '.org', function() {
        var owner = $(this).parent('li').attr('data-org-name')

        // reset currentPage to 1 if the org/user is not the same as the last selected one
        if (owner !== Github.currentOwner) {
           Github.currentPage = 1
        }
        else {
          Github.currentPage = (Github.currentPage || 1)
        }
        Github.currentOwner = owner
        Github.fetchRepos(Github.currentOwner)
        return false
      })
      .on('click', '.repos.pager .next', function() {
        Github.fetchRepos(Github.currentOwner, 'next')
        return false
      })
      .on('click', '.repos.pager .previous', function() {
        if (Github.currentPage <= 1) {
          return false
        }
        Github.fetchRepos(Github.currentOwner, 'prev')
        return false
      })
      .on('click', '.repo', function() {
        var owner = Github.currentOwner
          , repo = $(this).parent('li').attr('data-repo-name')

        Github.isRepoPrivate = $(this).parent('li').attr('data-repo-private') === 'true' ? true : false
        Github.fetchBranches(owner, repo)
        return false
      })
      .on('click', '.branch', function() {

        var owner = Github.currentOwner
          , repo = $(this).parent('li').attr('data-repo-name')
          , sha = $(this).parent('li').attr('data-commit-sha')
          , branch = $(this).text()

        Github.currentBranch = branch
        Github.fetchTreeFiles(owner, repo, branch, sha)
        return false
      })
      .on('click', '.tree_file', function() {

        var url = $(this).parent('li').attr('data-tree-file')
          , name = $(this).parent('li').attr('data-name')
          , sha = $(this).parent('li').attr('data-tree-file-sha')
          , owner = $(this).parent('li').attr('data-owner')
          , branch = $(this).parent('li').attr('data-branch')
          , repo = $(this).parent('li').attr('data-repo')

        Github.fetchMarkdownFile(url, {
          name: name
        , sha: sha
        , branch: branch
        , owner: owner
        , repo: repo
        })

        return false
      })

      .on('click', '.github_org', function() { // Back to organizations link
        delete Github.currentPage
        Github.fetchOrgs()
      })

      .on('click', '.github_repo', function() { // Back to repos link
        Github.fetchRepos(Github.currentOwner)
      })

      .on('click', '.dropbox_file', function() {

        // We stash the current filename in the local profile only; not in localStorage.
        // Upon success of fetching, we add it to localStorage.

        var dboxFilePath = $(this).parent('li').attr('data-file-path')

        profile.current_filename = dboxFilePath.split('/').pop().replace(arrayToRegExp(editorType().fileExts), '')

        Dropbox.setFilePath(dboxFilePath)

        Dropbox.fetchMarkdownFile(dboxFilePath)

        return false

      })
      .on('click', '.googledrive_file', function() {
        var fileId = $(this).parent('li').attr('data-file-id')
        profile.current_filename = $(this).html()
        GoogleDrive.fileId = fileId
        GoogleDrive.get()
        return false
      })
      .on('click', '.local_file', function() {
        var fileName = $(this).parent('li').attr('data-file-name')
        profile.current_filename = $(this).html()
        LocalFiles.loadFile(fileName)
        return false
      })
      .on('click', '.delete_local_file', function() {
        var $parentLi = $(this).parent('li')
        var fileName = $parentLi.attr('data-file-name')
        LocalFiles.deleteFile(fileName)
        $parentLi.remove()
        return false
      })

      // Check for support of drag/drop
      if('draggable' in document.createElement('span')) {
        $('#editor')
          .on('dragover', function (e) {
            e.preventDefault()
            e.stopPropagation()
          })
          .on('drop', function(e) {
            e.preventDefault()
            e.stopPropagation()

            // fetch FileList object
            var originalEvent = e.originalEvent
                , files = originalEvent.target.files || originalEvent.dataTransfer.files
                , reader = new FileReader()
                , i = 0
                , file
                , name

            // find the first text file
            do {
              file = files[i++]
            } while (file && file.type.substr(0, 4) !== 'text'
              && !_isFileExt(file.name))

            if (!file) return

            reader.onload = function (lE) {
              editor.getSession().setValue(lE.target.result)
              previewMd()
            }
            reader.readAsText(file)
          })
      } // end if draggable

  } // end bindDelegation()


  /// MODULES =================

  // LocalFiles Module
  var LocalFiles = (function() {

    // Sorting regardless of upper/lowercase
    // TODO: Let's be DRY and merge this with the
    // sort method in Github module.
    function _alphaNumSort(m,n) {
      var a = m.toLowerCase()
      var b = n.toLowerCase()
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
        list += '<li data-file-name="'
              + item + '"><a class="delete_local_file"><i class="icon-remove"></i></a><a class="local_file" href="#">'
              + item + '</a></li>'
      })

      list += '</ul>'

      $('.modal-header h3').text('Your Local Files')

      $('.modal-body').html(list)

      $('#modal-generic').modal({
        keyboard: true
        , backdrop: true
        , show: true
      })

      return false

    }

    return {
      newFile: function() {
        updateFilename("")
        setCurrentFilenameField()
        editor.getSession().setValue("")
      },
      search: function() {
        var fileList = Object.keys(profile.local_files);
        if(fileList.length < 1) {
          Notifier.showMessage('No files saved locally');
        } else {
          _listMdFiles(fileList);
        }
      },
      loadFile: function(fileName) {
        $('#modal-generic').modal('hide')
        updateFilename(fileName)
        setCurrentFilenameField()
        editor.getSession().setValue(profile.local_files[fileName])
        previewMd()

        // TODO:
        // Allow Github to unload it's current file if another file
        // gets loaded without touching these Dropbox/GoogleDrive objects.

        // This is to prevent a file not loaded from Github
        // from overwriting your file.
        Github.clear()

      },
      saveFile: function(showNotice) {
        var fileName = getCurrentFilenameFromField()
        var md = editor.getSession().getValue()
        var saveObj = { local_files: { } }
        saveObj.local_files[fileName] = md

        updateUserProfile(saveObj)

        if((typeof showNotice !== 'object') || showNotice.show !== false) {
          Notifier.showMessage(Notifier.messages.docSavedLocal)
        }

      },
      deleteFile: function(fileName) {
        var files = profile.local_files;
        delete profile.local_files[fileName];
        updateUserProfile()
        Notifier.showMessage(Notifier.messages.docDeletedLocal)
      }
    } // end return obj
  })() // end IIFE
  window.foo = LocalFiles.saveFile

  init()

  // TODO:  add window.resize() handlers.

/**
 * Get scrollHeight of preview div
 * (code adapted from https://github.com/anru/rsted/blob/master/static/scripts/editor.js)
 *
 * @param {Object} The jQuery object for the preview div
 * @return {Int} The scrollHeight of the preview area (in pixels)
 */
function getScrollHeight($prevFrame) {
    // Different browsers attach the scrollHeight of a document to different
    // elements, so handle that here.
    if ($prevFrame[0].scrollHeight !== undefined) {
        return $prevFrame[0].scrollHeight;
    } else if ($prevFrame.find('html')[0].scrollHeight !== undefined &&
               $prevFrame.find('html')[0].scrollHeight !== 0) {
        return $prevFrame.find('html')[0].scrollHeight;
    } else {
        return $prevFrame.find('body')[0].scrollHeight;
    }
}

/**
 * Scroll preview to match cursor position in editor session
 * (code adapted from https://github.com/anru/rsted/blob/master/static/scripts/editor.js)
 *
 * @return {Void}
 */

function syncPreview() {
  var $ed = window.ace.edit('editor');
  var $prev = $('#preview');

  var editorScrollRange = ($ed.getSession().getLength());

  var previewScrollRange = (getScrollHeight($prev));

  // Find how far along the editor is (0 means it is scrolled to the top, 1
  // means it is at the bottom).
  var scrollFactor = $ed.getFirstVisibleRow() / editorScrollRange;

  // Set the scroll position of the preview pane to match.  jQuery will
  // gracefully handle out-of-bounds values.
  $prev.scrollTop(scrollFactor * previewScrollRange);
}

window.onload = function() {
  var $loading = $('#loading')

  if ($.support.transition) {
    $loading
      .bind($.support.transitionEnd, function() {
        $('#main').removeClass('bye')
        $loading.remove()
      })
      .addClass('fade_slow');
  } else {
    $('#main').removeClass('bye')
    $loading.remove()
  }

  /**
   * Bind synchronization of preview div to editor scroll and change
   * of editor cursor position.
   */
  window.ace.edit('editor').session.on('changeScrollTop', syncPreview);
  window.ace.edit('editor').session.selection.on('changeCursor', syncPreview);
}
