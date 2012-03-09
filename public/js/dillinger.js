$(function(){
  
  var editor
    , converter
    , autoInterval
    , originalContPosition
    , githubUser
    , navShow = true
    , paperImgPath = '/img/notebook_paper_200x200.gif'
    , profile = 
      {
        theme: 'ace/theme/clouds_midnight'
      , showPaper: true
      , currentMd: ''
      , autosave: 
        {
          enabled: true
        , interval: 3000 // might be too aggressive; don't want to block UI for large saves.
        }
      , current_filename : 'Untitled Document'
      , dropbox:
        {
          filepath: '/Dillinger/'
        }
      }

  // Feature detect ish
  var dillinger = 'dillinger'
    , dillingerElem = document.createElement(dillinger)
    , dillingerStyle = dillingerElem.style
    , domPrefixes = 'Webkit Moz O ms Khtml'.split(' ')
    
  // Cache some shit
  var $cont = $('.cont') // TODO: horrible var name - change this (update HTML as well)
    , $core_menu = $('.core_menu')
    , $theme = $('#theme')
    , $preview = $('#preview')
    , $autosave = $('#autosave')
    , $toggleNav = $('#toggleNav')
    , $github_profile = $('#github_profile')
    , $nav = $('nav')

    
  // Hash of themes and their respective background colors
  var bgColors = 
    {
      'clouds': '#7AC9E3'
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
      
      
  /// UTILS =================
  

  /**
   * Utility method to async load a JavaScript file.
   *
   * @param {String} The name of the file to load
   * @param {Function} Optional callback to be executed after the script loads.
   * @return {void}
   */
  function asyncLoad(filename,cb){
    (function(d,t){

      var leScript = d.createElement(t)
        , scripts = d.getElementsByTagName(t)[0]
      
      leScript.async = 1
      leScript.src = filename
      scripts.parentNode.insertBefore(leScript,scripts)

      leScript.onload = function(){
        cb && cb()
      }

    }(document,'script'))
  }
  
  /**
   * Utility method to determin if localStorage is supported or not.
   *
   * @return {Boolean}
   */
  function hasLocalStorage(){
   // http://mathiasbynens.be/notes/localstorage-pattern  
   var storage
   try{ if(localStorage.getItem) storage = localStorage }catch(e){}
   return storage
  }

  /**
   * Grab the user's profile from localStorage and stash in "profile" variable.
   *
   * @return {Void}
   */
  function getUserProfile(){
    
    var p
    
    try{
      p = JSON.parse( localStorage['profile'] )
      // Need to merge in any undefined/new properties from last release 
      // Meaning, if we add new features they may not have them in profile
      p = $.extend(true, profile, p)
    }catch(e){
      p = profile
    }

    profile = p
    
    // console.dir(profile)
  }
  
  /**
   * Update user's profile in localStorage by merging in current profile with passed in param.
   *
   * @param {Object}  An object containg proper keys and values to be JSON.stringify'd
   * @return {Void}
   */
  function updateUserProfile(obj){
    localStorage.clear()
    localStorage['profile'] = JSON.stringify( $.extend(true, profile, obj) )
  }

  /**
   * Utility method to test if particular property is supported by the browser or not.
   * Completely ripped from Modernizr with some mods. 
   * Thx, Modernizr team! 
   *
   * @param {String}  The property to test
   * @return {Boolean}
   */
  function prefixed(prop){ return testPropsAll(prop, 'pfx') }

  /**
   * A generic CSS / DOM property test; if a browser supports
   * a certain property, it won't return undefined for it.
   * A supported CSS property returns empty string when its not yet set.
   *
   * @param  {Object}  A hash of properties to test
   * @param  {String}  A prefix
   * @return {Boolean}
   */
  function testProps( props, prefixed ) {
      
      for ( var i in props ) {
        
          if( dillingerStyle[ props[i] ] !== undefined ) {
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
  function testPropsAll( prop, prefixed ) {

      var ucProp  = prop.charAt(0).toUpperCase() + prop.substr(1)
        , props   = (prop + ' ' + domPrefixes.join(ucProp + ' ') + ucProp).split(' ')

      return testProps(props, prefixed)
  }
  
  /**
   * Normalize the transitionEnd event across browsers.
   *
   * @return {String} 
   */
  function normalizeTransitionEnd()
  {

    var transEndEventNames = 
      {
        'WebkitTransition' : 'webkitTransitionEnd'
      , 'MozTransition'    : 'transitionend'
      , 'OTransition'      : 'oTransitionEnd'
      , 'msTransition'     : 'msTransitionEnd' // maybe?
      , 'transition'       : 'transitionEnd'
      }

     return transEndEventNames[ prefixed('transition') ]
  }


  /**
   * Generate a random filename.
   *
   * @param  {String}  The file type's extension
   * @return {String} 
   */
  function generateRandomFilename(ext){
    return 'dillinger_' +(new Date()).toISOString().replace(/[\.:-]/g, "_")+ '.' + ext
  }


  /**
   * Get current filename from contenteditable field.
   *
   * @return {String} 
   */
  function getCurrentFilenameFromField(){
    return $('#filename > p[contenteditable="true"]').text()
  }


  /**
   * Set current filename from profile.
   *
   * @param {String}  Optional string to force set the value. 
   * @return {String} 
   */
  function setCurrentFilenameField(str){
    $('#filename > p[contenteditable="true"]').text( str || profile.current_filename || "Untitled Document")
  }


  /**
   * Initialize application.
   *
   * @return {Void}
   */
  function init(){

    if( !hasLocalStorage() ) sadPanda()
    else{
      
      // Attach to jQuery support object for later use.
      $.support.transitionEnd = normalizeTransitionEnd()
      
      getUserProfile()

      initAce()
      
      initUi()
      
      converter = new Showdown.converter()
      
      transitionEndNav()
      
      bindPreview()

      bindNav()
      
      bindKeyboard()
      
      bindDelegation()
      
      bindFilenameField()
              
      autoSave()
      
    }

  }

  /**
   * Initialize theme and other options of Ace editor.
   *
   * @return {Void}
   */
  function initAce(){
    
    editor = ace.edit("editor")
    
    fetchTheme(profile.theme, function(){

      editor.getSession().setUseWrapMode(true)
      editor.setShowPrintMargin(false)

      var MarkdownMode = require("ace/mode/markdown").Mode
      editor.getSession().setMode(new MarkdownMode())
      
      editor.getSession().setValue( profile.currentMd || editor.getSession().getValue())
      
      // Immediately populate the preview <div>
      previewMd()
    
    }) // end fetchTheme

  } // end initAce

  /**
   * Initialize various UI elements based on userprofile data.
   *
   * @return {Void}
   */
  function initUi(){
    
    // Set proper theme value in <select>
    $theme.find('option[value="'+ profile.theme +'"]').attr('selected', true)

    // Set/unset paper background image on preview
    // TODO: FIX THIS BUG
    $preview.css('backgroundImage', profile.showPaper ? 'url("'+paperImgPath+'")' : 'url("")' )
    
    // Set text for dis/enable autosave
    $autosave.text( profile.autosave.enabled ? 'Disable Autosave' : 'Enable Autosave' )
    
    // Check for logged in Github user and notifiy
    githubUser = $github_profile.attr('data-github-user')
    
    githubUser && Notifier.showMessage("What's Up " + githubUser, 1000)
    
    originalContPosition = $cont.css('right')
    
    setCurrentFilenameField()
    
  }


  /// HANDLERS =================

  
  /**
   * Clear the markdown and text and the subsequent HTML preview.
   *
   * @return {Void}
   */
  function clearSelection(){
    editor.getSession().setValue("")
    previewMd()    
  }

  // TODO: WEBSOCKET MESSAGE?
  /**
   * Save the markdown via localStorage - isManual is from a click or key event.
   *
   * @param {Boolean} 
   * @return {Void}
   */
  function saveFile(isManual){
    
    updateUserProfile({currentMd: editor.getSession().getValue()})
    
    isManual && Notifier.showMessage(Notifier.messages.docSavedLocal)
  
  }
  
  /**
   * Enable autosave for a specific interval.
   *
   * @return {Void}
   */
  function autoSave(){

    if(profile.autosave.enabled){
      autoInterval = setInterval( function(){
        // firefox barfs if I don't pass in anon func to setTimeout.
        saveFile()
      }, profile.autosave.interval)
      
    }
    else{
      clearInterval( autoInterval )
    }

  }
  
  /**
   * Clear out user profile data in localStorage.
   *
   * @return {Void}
   */
  function resetProfile(){
    // For some reason, clear() is not working in Chrome.
    localStorage.clear()
    // Let's turn off autosave
    profile.autosave.enabled = false
    // Delete the property altogether
    delete localStorage['profile']
    // Now reload the page to start fresh
    window.location.reload()
//    Notifier.showMessage(Notifier.messages.profileCleared, 1400)
  }

  /**
   * Combobox change event handler to update the current theme.
   *
   * @return {Void}
   */  
   function changeTheme(){
     // get selected val
     var t = $theme.find('option:selected').val()
     // check for same theme
     if(t === profile.theme) return
     else{
       fetchTheme(t, function(){
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
  function fetchTheme(th, cb){
    var name = th.split('/').pop()

    asyncLoad("/js/theme-"+ name +".js", function(){

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
  function updateBg(name){
    document.body.style.backgroundColor = bgColors[name]
  }
  
  /**
   * Clientside update showing rendered HTML of Markdown.
   *
   * @return {Void}
   */  
  function previewMd(){
    
    var unmd = editor.getSession().getValue()
      , md = converter.makeHtml(unmd)
    
    $preview
      .html('') // unnecessary?
      .html(md)
      
  }

  /**
   * Stash current file name in the user's profile.
   *
   * @param {String}  Optional string to force the value
   * @return {Void}
   */  
  function updateFilename(str){
    // Check for string because it may be keyup event object
    if(typeof str === 'string'){
      f = str
    }else
    {
      f = getCurrentFilenameFromField()
    }
    updateUserProfile( {current_filename: f })
  }
  
  /**
   * XHR Post Markdown to get a md file.  Appends response to hidden iframe to 
   * automatically download the file.
   *
   * @return {Void}
   */  
  function fetchMarkdownFile(){
    
    // TODO: UPDATE TO SUPPORT FILENAME NOT JUST A RANDOM FILENAME
    
    var unmd = editor.getSession().getValue()
    
    function _beforeSendHandler(jqXHR, data){}

    function _doneHandler(jqXHR, data, response){
      // console.dir(resp)
      var resp = JSON.parse(response.responseText)
      document.getElementById('downloader').src = '/files/md/' + resp.data
    }

    function _failHandler(jqXHR, errorString, err){
        alert("Roh-roh. Something went wrong. :(")
    }

    function _alwaysHandler(jqXHR, data){}
    
    var mdConfig = {
                      type: 'POST',
                      data: "unmd=" + encodeURIComponent(unmd),
                      dataType: 'json',
                      url: '/factory/fetch_markdown',
                      beforeSend: _beforeSendHandler,
                      error: _failHandler,
                      success: _doneHandler,
                      complete: _alwaysHandler
                    }

    $.ajax(mdConfig)  
    
  }

  /**
   * XHR Post Markdown to get a html file.  Appends response to hidden iframe to 
   * automatically download the file.
   *
   * @return {Void}
   */  
  function fetchHtmlFile(){
    
    // TODO: UPDATE TO SUPPORT FILENAME NOT JUST A RANDOM FILENAME
    
    var unmd = editor.getSession().getValue()
    
    function _beforeSendHandler(jqXHR, data){}

    function _doneHandler(jqXHR, data, response){
      // console.dir(resp)
      var resp = JSON.parse(response.responseText)
      document.getElementById('downloader').src = '/files/html/' + resp.data
    }

    function _failHandler(jqXHR, errorString, err){
      alert("Roh-roh. Something went wrong. :(")
    }

    function _alwaysHandler(jqXHR, data){}
    
    var config = {
                      type: 'POST',
                      data: "unmd=" + encodeURIComponent(unmd),
                      dataType: 'json',
                      url: '/factory/fetch_html',
                      beforeSend: _beforeSendHandler,
                      error: _failHandler,
                      success: _doneHandler,
                      complete: _alwaysHandler
                    }

    $.ajax(config)  
    
  }

  /**
   * Show a sad panda because they are using a shitty browser. 
   *
   * @return {Void}
   */  
  function sadPanda(){
    // TODO: ACTUALLY SHOW A SAD PANDA.
    alert('Sad Panda - No localStorage for you!')
  }

  /**
   * Show the modal for the "About Dillinger" information.
   *
   * @return {Void}
   */  
  function showAboutInfo(){

    $('.modal-header h3').text("What's the deal with Dillinger?")

    // TODO: PULL THIS OUT AND RENDER VIA TEMPLATE FROM XHR OR STASH IN PAGE FOR SEO AND CLONE
    var aboutContent =  "<p>Dillinger is an online cloud-enabled, HTML5, buzzword-filled Markdown editor.</p>"
                      + "<p>Dillinger was designed and developed by <a href='http://twitter.com/joemccann'>@joemccann</a> because he needed a decent Markdown editor.</p>"
                      + "<p>Dillinger is a 100% open source project so <a href='https://github.com/joemccann/dillinger'>fork the code</a> and contribute!</p>"
                      + "<p>Follow Dillinger on Twitter at <a href='http://twitter.com/dillingerapp'>@dillingerapp</a></p>"
  
    $('.modal-body').html(aboutContent)

    $('#modal-generic').modal({
      keyboard: true,
      backdrop: true,
      show: true
    })
    
  }
  
  
  /// UI RELATED =================


  /**
   * Transition End Event handler for the nav when it is hidden/shown.
   *
   * @return {Void}
   */  
  function transitionEndNav(){
    
    $nav.bind( $.support.transitionEnd, function(e){
      
      // Required because of weird bubbling from hovering on nav anchors that have transitions
      if( $('nav').hasClass('slide_in') ) return 
      
      $toggleNav
        .text(navShow ? 'Show Navigation' : 'Hide Navigation')

      $core_menu.slideToggle(50, function(){

        $cont[navShow ? 'addClass' : 'removeClass']('opacity_thirty')
          .animate({right: navShow ? '-40px' : originalContPosition}, 200)
          navShow = !navShow
      })
      
    })
    
  }

  /**
   * Hide show the navigation and the toggle navigation button. 
   *
   * @return {Void}
   */  
  function toggleNav(){

    if( $nav.hasClass('slide_in') ){

      $nav
        .removeClass('slide_in')
        .addClass('slide_out')
      
    }
    else{

      $nav
        .removeClass('slide_out')
        .addClass('slide_in')
      
    }
  }
  
  /**
   * Toggles the paper background image. 
   *
   * @return {Void}
   */  
  function togglePaper(){
    
    $preview.css('backgroundImage', !profile.showPaper ? 'url("'+paperImgPath+'")' : 'url("")'  )

    updateUserProfile({showPaper: !profile.showPaper})
    
    Notifier.showMessage(Notifier.messages.profileUpdated)

  }
  
  /**
   * Toggles the autosave feature. 
   *
   * @return {Void}
   */  
  function toggleAutoSave(){

    $autosave.text( profile.autosave.enabled ? 'Enable Autosave' : 'Disable Autosave' )

    updateUserProfile({autosave: {enabled: !profile.autosave.enabled }})

    autoSave()
  
  }


  /**
   * Bind keyup handler to the editor.
   *
   * @return {Void}
   */  
  function bindFilenameField(){
    $('#filename > p[contenteditable="true"]').bind('keyup', updateFilename)
  }
  
  
  /**
   * Bind keyup handler to the editor.
   *
   * @return {Void}
   */  
  function bindPreview(){
    $('#editor').bind('keyup', previewMd)
  }
  
  /**
   * Bind navigation elements.
   *
   * @return {Void}
   */  
  function bindNav(){
    
    var hoverConfig = {    
      over: function(){
        if( $('nav').hasClass('slide_in') ) return
        else{
          $cont
            .removeClass('opacity_thirty')
            .animate({right: originalContPosition}, 200)
          }
      }, 
      timeout: 300,     
      out: function(){
        if( $('nav').hasClass('slide_in') ) return
        else{
          if( $core_menu.is(':visible') ) $core_menu.slideToggle(50)
          $cont
            .animate({right: '-40px'}, 200)
            .addClass('opacity_thirty')
        }
      }
    }
    
    $('.core_inner')
      .on('click', function(){
        $core_menu.slideToggle(50)
      })
      
    $cont.hoverIntent( hoverConfig )

    $('#clear')
      .on('click', function(){
        clearSelection()
        return false
      })
    
    $('#save')
      .on('click', function(){
        
        profile.current_filename = profile.current_filename || '/Dillinger/' + generateRandomFilename('md')

        Dropbox.putMarkdownFile()

        saveFile()
        
        return false
      })

    $('#paper')
      .on('click', function(){
        togglePaper()
        return false
      })
    
    $theme
      .on('change', function(){
        changeTheme()
        return false
      })

    $toggleNav
      .on('click', function(){
        toggleNav()
        return false
      })
    
    $('#reset')
      .on('click', function(){
        resetProfile()
        return false
      })
      
    $autosave
      .on('click', function(){
        toggleAutoSave()
        return false
      })
  
    $github_profile
      .on('click', function(){
        Github.fetchRepos()
        return false
      })

    $('#dropbox_profile')
      .on('click', function(){
        Dropbox.searchDropbox()
        return false
      })
    
    $('#export_md')
      .on('click', function(){
        fetchMarkdownFile()
        return false
      })

    $('#export_html')
      .on('click', function(){
        fetchHtmlFile()
        return false
      })

    $('#about').
      on('click', function(){
        showAboutInfo()
        return false
      })

  } // end bindNav()

  /**
   * Bind special keyboard handlers.
   *
   * @return {Void}
   */  
  function bindKeyboard(){
    // CMD+s TO SAVE DOC
    key('command+s, ctrl+s', function(e){
     saveFile(true)
     e.preventDefault() // so we don't save the webpage - native browser functionality
    })
    
    var command = {
       name: "save",
       bindKey: {
                mac: "Command-S",
                win: "Ctrl-S"
              },
       exec: function(){ 
         saveFile() 
       }
    }
    
  }

  /**
   * Bind dynamically added elements' handlers.
   *
   * @return {Void}
   */  
  function bindDelegation(){
    $(document)
      .on('click', '.repo', function(){
        var repoName = $(this).parent('li').attr('data-repo-name')
        
        Github.isRepoPrivate = $(this).parent('li').attr('data-repo-private') === 'true' ? true : false
                
        Github.fetchBranches( repoName ) 
        return false
      })
      .on('click', '.branch', function(){
        
        var repo = $(this).parent('li').attr('data-repo-name')
          , sha = $(this).parent('li').attr('data-commit-sha')
        
        Github.currentBranch = $(this).text() 
        
        Github.fetchTreeFiles( repo, sha ) 
        return false
      })
      .on('click', '.tree_file', function(){

        var file = $(this).parent('li').attr('data-tree-file')

        Github.fetchMarkdownFile(file)
          
        return false
      })
      .on('click', '.dropbox_file', function(){
        
        // We stash the current filename in the local profile only; not in localStorage.
        // Upon success of fetching, we add it to localStorage.
        
        var dboxFilePath = $(this).parent('li').attr('data-file-path')

        profile.current_filename = dboxFilePath.split('/').pop().replace('.md', '')

        Dropbox.setFilePath( dboxFilePath )

        Dropbox.fetchMarkdownFile( dboxFilePath )
          
        return false
        
      })
  }


  /// MODULES =================


  // Notification Module
  var Notifier = (function(){
    
    var _el = $('#notify')      
    
      return {
        messages: {
          profileUpdated: "Profile updated"
          , profileCleared: "Profile cleared"
          , docSavedLocal: "Document saved locally"
          , docSavedServer: "Document saved on our server"
          , docSavedDropbox: "Document saved on dropbox"
          , dropboxImportNeeded: "Please import a file from dropbox first."
        },
        showMessage: function(msg,delay){
          
          // TODO: FIX ANIMATION QUEUE PROBLEM - .stop() doesn't work.

          _el
            .text('')
            .stop()
            .text(msg)
            .slideDown(250, function(){
              _el
                .delay(delay || 1000)
                .slideUp(250)
            })

          } // end showMesssage
      } // end return obj
  })() // end IIFE

  // Github API Module
  var Github = (function(){
    
    // Sorting regardless of upper/lowercase
    function _alphaNumSort(m,n) {
      a = m.url.toLowerCase()
      b = n.url.toLowerCase()
      if (a === b) { return 0 }
      if (isNaN(m) || isNaN(n)){ return ( a > b ? 1 : -1)} 
      else {return m-n}
    }
    
    // Test for md file extension
    function _isMdFile(file){
      return /(\.md)|(\.markdown)/i.test(file)
    }
    
    // Returns an array of only md files from a tree
    function _extractMdFiles(repoName, treefiles){
      /*
      mode: "100644"
      path: ".gitignore"
      sha: "7a1aeb2497018aeb0c44e220d4b84f2d245e3033"
      size: 110
      type: "blob"
      url: "https://api.github.com/repos/joemccann/express/git/blobs/7a1aeb2497018aeb0c44e220d4b84f2d245e3033"
      */
      // https://raw.github.com/joemccann/express/master/History.md
      
      var sorted = []
        , raw = 'https://raw.github.com'
        , slash = '/'  

      treefiles.forEach(function(el){
        
        if( _isMdFile(el.path) ){
          
          var fullpath
          
          if( Github.isRepoPrivate){
            fullpath = el.url
          }
          else{
            // we go straight to raw as it's faster (don't need to base64 decode the sha as in the private case)
            fullpath = raw + slash + githubUser + slash + repoName + slash + Github.currentBranch + slash + el.path
          }
                    
          var item = 
          {
            link: fullpath
          , path: el.path
          , sha: el.sha
          }

          sorted.push( item )
        }
        
      }) // end forEach()
      
      return sorted
      
    }
    
    // Show a list of repos
    function _listRepos(repos){

      var list = '<ul>'
      
      // Sort alpha
      repos.sort(_alphaNumSort)

      repos.forEach(function(item){
        var name = item.url.split('/').pop()
        list += '<li data-repo-name="' + name + '" data-repo-private="' + item.private + '"><a class="repo" href="#">' + name + '</a></li>'
      })

      list += '</ul>'
  
      $('.modal-header h3').text('Your Github Repos')
      
      $('.modal-body').html(list)
  
      $('#modal-generic').modal({
        keyboard: true,
        backdrop: true,
        show: true
      })
        
      return false
  
    }
    
    // Show a list of branches
    function _listBranches(repoName, branches){
      
      var list = ''
      
      branches.forEach(function(item){
        var name = item.name
          , commit = item.commit.sha
        list += '<li data-repo-name="' + repoName + '" data-commit-sha="' + commit + '"><a class="branch" href="#">' + name + '</a></li>'
      })
      
      $('.modal-header h3').text(repoName)

      $('.modal-body')
        .find('ul')
          .find('li')
          .remove()
          .end()
        .append(list)
    }
    
    // Show a list of tree files
    function _listTreeFiles(repoName, treefiles){ 
      
      var mdFiles = _extractMdFiles(repoName, treefiles)
        , list = ''
      
      mdFiles.forEach(function(item){
        // add class to <li> if private
        list += Github.isRepoPrivate 
                ? '<li data-tree-file-sha="' + item.sha + '" data-tree-file="' + item.link + '" class="private_repo"><a class="tree_file" href="#">' + item.path + '</a></li>'
                : '<li data-tree-file="' + item.link + '"><a class="tree_file" href="#">' + item.path + '</a></li>'

      })
      
      $('.modal-header h3').text(repoName)

      $('.modal-body')
        .find('ul')
          .find('li')
          .remove()
          .end()
        .append(list)
    }

    return{
      currentBranch: '',
      isRepoPrivate: false,
      fetchRepos: function(){

        function _beforeSendHandler(jqXHR, data){
          Notifier.showMessage('Fetching Repos...')
        }

        function _doneHandler(jqXHR, data, response){
          response = JSON.parse(response.responseText)
          // console.dir(response)
          if( !response.length ) Notifier.showMessage('No repos available!')
          else {
            _listRepos(response)
          } // end else
        } // end done handler

        function _failHandler(jqXHR, errorString, err){
          alert("Roh-roh. Something went wrong. :(")
        }

        function _alwaysHandler(jqXHR, data){}

        var config = {
                        type: 'POST',
                        dataType: 'text',
                        url: '/github/repo/fetch_all',
                        beforeSend: _beforeSendHandler,
                        error: _failHandler,
                        success: _doneHandler,
                        complete: _alwaysHandler
                      }

        $.ajax(config)  
        
      }, // end fetchRepos
      fetchBranches: function(repoName){
  
        function _beforeSendHandler(jqXHR, data){
          Notifier.showMessage('Fetching Branches for Repo '+repoName)
        }

        function _doneHandler(jqXHR, data, response){
          response = JSON.parse(response.responseText)
          //console.dir(response)
          if( !response.length ) {
            Notifier.showMessage('No branches available!')
            $('#modal-generic').modal('hide')
          }
          else {
            _listBranches(repoName, response)
          } // end else
        } // end done handler

        function _failHandler(jqXHR, errorString, err){
          alert("Roh-roh. Something went wrong. :(")
        }

        function _alwaysHandler(jqXHR, data){}

        var config = {
                        type: 'POST',
                        dataType: 'json',
                        data: 'repo=' + repoName,
                        url: '/github/repo/fetch_branches',
                        beforeSend: _beforeSendHandler,
                        error: _failHandler,
                        success: _doneHandler,
                        complete: _alwaysHandler
                      }

        $.ajax(config)  

      }, // end fetchBranches()
      fetchTreeFiles: function(repoName, sha){
  
        function _beforeSendHandler(jqXHR, data){
          Notifier.showMessage('Fetching Tree for Repo '+repoName)
        }

        function _doneHandler(jqXHR, data, response){
          response = JSON.parse(response.responseText)
          // console.log('\nFetch Tree Files...')
          // console.dir(response)
          if( !response.tree.length ) {
            Notifier.showMessage('No tree files available!')
            $('#modal-generic').modal('hide')
          }
          else {
            _listTreeFiles(repoName, response.tree)
          } // end else
        } // end done handler

        function _failHandler(jqXHR, errorString, err){
          alert("Roh-roh. Something went wrong. :(")
        }

        function _alwaysHandler(jqXHR, data){}

        var config = {
                        type: 'POST',
                        dataType: 'json',
                        data: 'repo=' + repoName + '&sha=' + sha,
                        url: '/github/repo/fetch_tree_files',
                        beforeSend: _beforeSendHandler,
                        error: _failHandler,
                        success: _doneHandler,
                        complete: _alwaysHandler
                      }

        $.ajax(config)  

      }, // end fetchTreeFiles()
      fetchMarkdownFile: function(filename){
        
        function _beforeSendHandler(jqXHR, data){}

        function _doneHandler(jqXHR, data, response){
          response = JSON.parse(response.responseText)
          // console.dir(response)
          if( response.error ) {
            
            Notifier.showMessage('No markdown for you!')
            $('#modal-generic').modal('hide')

          }
          else{
            
            $('#modal-generic').modal('hide')

            editor.getSession().setValue( response.data )
            previewMd()
            
          } // end else
        } // end done handler

        function _failHandler(jqXHR, errorString, err){
          alert("Roh-roh. Something went wrong. :(")
        }

        function _alwaysHandler(jqXHR, data){}
        
        var config = {
                        type: 'POST',
                        dataType: 'json',
                        data: 'mdFile=' + filename,
                        url: '/github/repo/fetch_markdown_file',
                        beforeSend: _beforeSendHandler,
                        error: _failHandler,
                        success: _doneHandler,
                        complete: _alwaysHandler
                      }

        $.ajax(config)  

      } // end fetchMarkdownFile()
    
    } // end return obj
  
  })() // end IIFE

  // Dropbox Module
  var Dropbox = (function(){
    
    // Sorting regardless of upper/lowercase
    // TODO: Let's be DRY and merge this with the
    // sort method in Github module.
    function _alphaNumSort(m,n) {
      a = m.path.toLowerCase()
      b = n.path.toLowerCase()
      if (a === b) { return 0 }
      if (isNaN(m) || isNaN(n)){ return ( a > b ? 1 : -1)} 
      else {return m-n}
    }
    
    function _listMdFiles(files){

      var list = '<ul>'
      
      // Sort alpha
      files.sort(_alphaNumSort)

      files.forEach(function(item){
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
    
    function _encodeFilename(path){
      return encodeURIComponent( path.split('/').pop() )
    }
    
    function _removeFilenameFromPath(path){
      // capture the name
      var name = path.split('/').pop()
      // then just replace with nothing on the path. boom.
      return path.replace(name, '')
    }
    
    return {
      fetchAccountInfo: function(){

        function _beforeSendHandler(jqXHR, data){
          Notifier.showMessage('Fetching User Info from Dropbox')
        }

        function _doneHandler(jqXHR, data, response){
          var resp = JSON.parse(response.responseText)
          // console.log('\nFetch User Info...')
          // console.dir(resp)
          Notifier
            .showMessage('Sup '+ resp.display_name)
        } // end done handler

        function _failHandler(jqXHR, errorString, err){
          alert("Roh-roh. Something went wrong. :(")
        }

        function _alwaysHandler(jqXHR, data){}

        var config = {
                        type: 'GET',
                        dataType: 'json',
                        url: '/dropbox/account/info',
                        beforeSend: _beforeSendHandler,
                        error: _failHandler,
                        success: _doneHandler,
                        complete: _alwaysHandler
                      }

        $.ajax(config)  

      }, // end fetchAccuntInfo()
      fetchMetadata: function(){

        function _beforeSendHandler(jqXHR, data){
          Notifier.showMessage('Fetching Metadata')
        }

        function _doneHandler(jqXHR, data, response){
          var resp = JSON.parse(response.responseText)
          // console.dir(resp)
        } // end done handler

        function _failHandler(jqXHR, errorString, err){
          alert("Roh-roh. Something went wrong. :(")
        }

        function _alwaysHandler(jqXHR, data){}

        var config = {
                        type: 'GET',
                        dataType: 'json',
                        url: '/dropbox/metadata',
                        beforeSend: _beforeSendHandler,
                        error: _failHandler,
                        success: _doneHandler,
                        complete: _alwaysHandler
                      }

        $.ajax(config)  

      }, // end fetchMetadata()
      searchDropbox: function(){

        function _beforeSendHandler(jqXHR, data){
          Notifier.showMessage('Searching for .md Files')
        }

        function _doneHandler(jqXHR, data, response){

          var resp = JSON.parse(response.responseText)
                    
          if(resp.hasOwnProperty('statusCode') && resp.statusCode === 401){
            // {"statusCode":401,"data":"{\"error\": \"Access token is disabled.\"}"}
            
            var data = JSON.parse(resp.data)
            
            Notifier.showMessage('Error! ' + data.error, 1000)
            
            setTimeout(function(){
              Notifier.showMessage('Reloading!')
              window.location.reload()
            }, 1250)

            return

          }

          if(!resp.length){
            Notifier.showMessage('No .md files found!')
          }
          else{
            // console.dir(resp)
            _listMdFiles(resp)
          }
        } // end done handler

        function _failHandler(jqXHR, errorString, err){
          alert("Roh-roh. Something went wrong. :(")
        }

        function _alwaysHandler(jqXHR, data){}

        var config = {
                        type: 'GET',
                        dataType: 'json',
                        url: '/dropbox/search',
                        beforeSend: _beforeSendHandler,
                        error: _failHandler,
                        success: _doneHandler,
                        complete: _alwaysHandler
                      }

        $.ajax(config)  

      }, // end searchDropbox()
      fetchMarkdownFile: function(filename){
        
        function _beforeSendHandler(jqXHR, data){}

        function _doneHandler(jqXHR, data, response){
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
            
          } // end else
        } // end done handler

        function _failHandler(jqXHR, errorString, err){
          alert("Roh-roh. Something went wrong. :(")
        }

        function _alwaysHandler(jqXHR, data){}
        
        // Weird encoding mumbo jumbo columbo
        var enc = _encodeFilename(filename)
        var path = _removeFilenameFromPath(filename)
        
        filename = path + enc
        
        var config = {
                        type: 'POST',
                        dataType: 'json',
                        data: 'mdFile=' + filename,
                        url: '/dropbox/files/get',
                        beforeSend: _beforeSendHandler,
                        error: _failHandler,
                        success: _doneHandler,
                        complete: _alwaysHandler
                      }

        $.ajax(config)  

      }, // end fetchMarkdownFile()
      setFilePath: function(path){
        path = _removeFilenameFromPath(path)
        updateUserProfile({dropbox: {filepath: path }})
      },
      putMarkdownFile: function(){
        
        function _beforeSendHandler(jqXHR, data){}

        function _doneHandler(jqXHR, data, response){
          response = JSON.parse(response.responseText)
          // console.dir(response)
          if( response.statusCode >= 204 ) {

            var msg = JSON.parse( response.data )

            Notifier.showMessage(msg.error, 5000)

          }
          else{
            
            $('#modal-generic').modal('hide')
            
            // console.dir(JSON.parse(response.data))

            Notifier.showMessage( Notifier.messages.docSavedDropbox )
            
          } // end else
        } // end done handler

        function _failHandler(jqXHR, errorString, err){
          alert("Roh-roh. Something went wrong. :(")
        }

        function _alwaysHandler(jqXHR, data){}
        
        var md = encodeURIComponent( editor.getSession().getValue() )
        
        var postData = 'pathToMdFile=' + profile.dropbox.filepath + encodeURIComponent(profile.current_filename) + '.md' + '&fileContents=' + md
        
        var config = {
                        type: 'POST',
                        dataType: 'json',
                        data: postData,
                        url: '/dropbox/files/put',
                        beforeSend: _beforeSendHandler,
                        error: _failHandler,
                        success: _doneHandler,
                        complete: _alwaysHandler
                      }

        $.ajax(config)  

      } // end fetchMarkdownFile()
    } // end return obj
  })() // end IIFE


  init()
  
  // TODO:  add window.resize() handlers.

})

window.onload = function(){
  var $loading = $('#loading')
  
  $loading
    .bind( $.support.transitionEnd, function(e){
      $('#main').removeClass('bye')
      $loading.remove()
    })
    .addClass('fade_slow')
    
}
