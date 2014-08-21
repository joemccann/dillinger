// Github API Module
var Github = (function() {

  // Sorting regardless of upper/lowercase
  function _alphaNumSort(m,n) {
    var a = m.url.toLowerCase()
    var b = n.url.toLowerCase()
    if (a === b) { return 0 }
    if (isNaN(m) || isNaN(n)) { return (a > b ? 1 : -1) }
    else { return m-n }
  }

  // Returns an array of only files from a tree that matches editor file extension
  function _extractMdFiles(repo, treefiles) {
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
      , ghRegex = /https:\/\/api.github.com\/(.*?)\/(.*?)\/(.*?)\/(.*)/i
      ;

    treefiles.forEach(function(el) {

      if (_isFileExt(el.path)) {

        var fullpath
          , ghArr
          , repo
          , owner

        ghArr = el.url.match(ghRegex)
        owner = ghArr[2]
        repo = ghArr[3]

        if (Github.isRepoPrivate) {
          fullpath = el.url
        }
        else {
          // we go straight to raw as it's faster (don't need to base64 decode the sha as in the private case)
          fullpath = raw + slash + owner + slash + repo + slash + Github.currentBranch + slash + el.path
        }

        var item = {
          link: fullpath
        , path: el.path
        , sha: el.sha
        , repo: repo
        , owner: owner
        }

        sorted.push(item)
      }

    }) // end forEach()

    return sorted

  }

  // Show a list of orgs
  function _listOrgs(orgs) {

    var list = '<ul>' +
      '<li data-org-name="' + githubUser + '" data-user="true"><a class="org" href="#">' + githubUser + '</a></li>'
    ;

    // Sort alpha
    orgs.sort(_alphaNumSort)

    orgs.forEach(function(item) {

      list += '<li data-org-name="' + item.name + '"><a class="org" href="#">' + item.name + '</a></li>'
    })

    list += '</ul>'

    $('.modal-header h3').text('Your Github Orgs')

    $('.modal-body').html(list)

    $('#modal-generic').modal({
      keyboard: true
    , backdrop: true
    , show: true
    })

    return false

  }

  // Show a list of repos
  function _listRepos(repos) {

    var list = '<li class="github_org"><a href="#">Back to organizations...</a></li>'
      , pagination = '<ul class="repos pager"><li class="previous' + (!Github.currentPage || Github.currentPage === 1 ? " disabled" : "") + '"><a href="#">&larr; Prev</a></li><li class="next"><a href="#">Next &rarr;</a></li></ul>'

    // Sort alpha
    repos.sort(_alphaNumSort)

    repos.forEach(function(item) {
      list += '<li data-repo-name="' + item.name + '" data-repo-private="' + item.private + '"><a class="repo" href="#">' + item.name + '</a></li>'
    })

    $('.modal-header h3').text(Github.currentOwner)

    $('.modal-body')
      .find('ul')
        .find('li')
        .remove()
        .end()
      .append(list)
      .end()
      .find('.pager')
        .remove()
        .end()
        .append(pagination)

    $('#modal-generic').modal({
      keyboard: true
    , backdrop: true
    , show: true
    })

    return false
  }

  // Show a list of branches
  function _listBranches(repo, branches) {

    var list = '<li class="github_repo"><a href="#">Back to repositories...</a></li>'

    branches.forEach(function(item) {
      var name = item.name
        , commit = item.commit.sha
      list += '<li data-repo-name="' + repo + '" data-commit-sha="' + commit + '"><a class="branch" href="#">' + name + '</a></li>'
    })

    $('.modal-header h3').text(Github.currentOwner + " > " + repo)

    $('.modal-body')
      .find('ul')
        .find('li')
        .remove()
        .end()
      .append(list)
      .end()
      .find('.pager')
        .remove()

  }

  // Show a list of tree files
  function _listTreeFiles(repo, branch, sha, treefiles) {

    var mdFiles = _extractMdFiles(repo, treefiles)
      , list = '<li class="refresh_branches" data-repo-name="' + repo + '"><a class="repo" href="#">Back to branches in ' + repo + '...</a></li>'

    if (mdFiles.length === 0) {
      list += '<li class="no_files">No Markdown files in this branch</li>'
    }
    else {
      mdFiles.forEach(function(item) {
        // add class to <li> if private
        list += Github.isRepoPrivate
                ? '<li data-tree-file-sha="' + item.sha + '" data-tree-file="' + item.link + '" data-repo="' + item.repo + '" data-owner="' + item.owner + '" data-name="' + item.path + '" data-branch="' + branch + '" class="private_repo"><a class="tree_file" href="#">' + item.path + '</a></li>'
                : '<li data-tree-file-sha="' + item.sha + '" data-tree-file="' + item.link + '" data-repo="' + item.repo + '" data-owner="' + item.owner + '" data-name="' + item.path + '" data-branch="' + branch + '"><a class="tree_file" href="#">' + item.path + '</a></li>'

      });
    }

    $('.modal-header h3').text(Github.currentOwner + " > " + repo + " > " + Github.currentBranch)

    $('.modal-body')
      .find('ul')
        .find('li')
        .remove()
        .end()
      .append(list)
      .end()
      .find('.pager')
        .remove()
  }

  return {
    isRepoPrivate: false,
    fetchOrgs: function() {

      function _beforeSendHandler() {
        Notifier.showMessage('Fetching Orgs...')
      }

      function _doneHandler(a, b, response) {
        a = b = null
        response = JSON.parse(response.responseText)
        // Don't throw error if user has no orgs, still has individual user.
        _listOrgs(response)
      } // end done handler

      function _failHandler(resp, err) {
        alert(resp.responseText || "Roh-roh. Something went wrong. :(")
      }

      var config = {
        type: 'POST'
      , dataType: 'text'
      , url: '/import/github/orgs'
      , beforeSend: _beforeSendHandler
      , error: _failHandler
      , success: _doneHandler
      }

      $.ajax(config)

    }, // end fetchRepos

    fetchRepos: function(owner, pager) {

      function _beforeSendHandler() {
        Notifier.showMessage('Fetching Repos...')
      }

      function _doneHandler(a, b, response) {
        a = b = null
        response = JSON.parse(response.responseText)
        // console.dir(response)
        if (!response.length) { Notifier.showMessage('No repos available!') }
        else {

          if (pager === 'next') {
            Github.currentPage++;
          }
          if (pager === 'prev') {
            Github.currentPage--;
          }

          if (Github.currentPage <= 1) {
            $('.repos.pager .previous').addClass('disabled')
          }
          else {
            $('.repos.pager .previous').removeClass('disabled')
          }

          if (Github.currentPage < 1) {
            Github.currentPage = 1
          }

          _listRepos(response)
        } // end else
      } // end done handler

      function _failHandler(resp, err) {
        alert(resp.responseText || "Roh-roh. Something went wrong. :(")
      }

      var config = {
        type: 'POST'
      , dataType: 'text'
      , url: '/import/github/repos'
      , beforeSend: _beforeSendHandler
      , error: _failHandler
      , success: _doneHandler
      }
      var page

      config.data = 'owner=' + owner

      if (pager === 'next') {
        page = Github.currentPage + 1
      }
      else if (pager === 'prev') {
        page = Github.currentPage - 1
      }
      else {
        page = Github.currentPage
      }

      if (page > 1) {
        config.data += '&page=' + page
      }

      $.ajax(config)

    }, // end fetchRepos
    fetchBranches: function(owner, repo) {

      function _beforeSendHandler() {
        Notifier.showMessage('Fetching Branches for Repo ' + repo)
      }

      function _doneHandler(a, b, response) {
        a = b = null
        response = JSON.parse(response.responseText)

        if (!response.length) {
          Notifier.showMessage('No branches available!')
        }
        else {
          _listBranches(repo, response)
        } // end else
      } // end done handler

      function _failHandler() {
        alert("Roh-roh. Something went wrong. :(")
      }

      var config = {
        type: 'POST'
      , dataType: 'json'
      , data: 'owner=' + owner + '&repo=' + repo
      , url: '/import/github/branches'
      , beforeSend: _beforeSendHandler
      , error: _failHandler
      , success: _doneHandler
      }

      $.ajax(config)

    }, // end fetchBranches()
    fetchTreeFiles: function(owner, repo, branch, sha) {

      function _beforeSendHandler() {
        Notifier.showMessage('Fetching Tree for Repo ' + repo)
      }

      function _doneHandler(a, b, response) {
        a = b = null
        response = JSON.parse(response.responseText)
        // console.log('\nFetch Tree Files...')
        // console.dir(response)
        if (!response.tree.length) {
          Notifier.showMessage('No tree files available!')
        }
        else {
          _listTreeFiles(repo, branch, sha, response.tree)
        } // end else
      } // end done handler

      function _failHandler() {
        alert("Roh-roh. Something went wrong. :(")
      }

      var config = {
        type: 'POST'
      , dataType: 'json'
      , data: 'owner=' + owner + '&repo=' + repo + '&branch=' + branch + '&sha=' + sha + '&fileExts=' + editorType().fileExts.join('|')
      , url: '/import/github/tree_files'
      , beforeSend: _beforeSendHandler
      , error: _failHandler
      , success: _doneHandler
      }

      $.ajax(config)

    }, // end fetchTreeFiles()
    fetchMarkdownFile: function(url, opts) {

      function _doneHandler(a, b, response) {
        a = b = null
        response = JSON.parse(response.responseText)
        // console.dir(response)
        if (response.error) {
          Notifier.showMessage('No markdown for you!')
        }
        else {

          $('#modal-generic').modal('hide')

          editor.getSession().setValue(response.data)

          var name = opts.name.split('/').pop()

          // Update it in localStorage
          updateFilename(name)

          // Show it in the field
          setCurrentFilenameField(name)

          Github.setInfo(url, opts);


          previewMd()

        } // end else
      } // end done handler

      function _failHandler() {
        alert("Roh-roh. Something went wrong. :(")
      }

      function _alwaysHandler() {
        $('.dropdown').removeClass('open')
      }

      var config = {
        type: 'POST'
      , dataType: 'json'
      , data: 'url=' + url + "&name=" + name
      , url: '/import/github/file'
      , error: _failHandler
      , success: _doneHandler
      , complete: _alwaysHandler
      }

      $.ajax(config)

    }, // end fetchMarkdownFile()

    clear: function() {
      delete profile.github.current_uri;
      delete profile.github.opts;
    },
    setInfo: function(uri, opts) {
      profile.github.current_uri = uri;
      profile.github.opts = opts;
    },
    getUri: function() {
      return profile.github.current_uri;
    },
    save: function() {
      // convert file inside ACE editor from UTF-8 text into base64
      // reference: https://developer.mozilla.org/en-US/docs/Web/API/Window.btoa

      function _failHandler(e) {
        alert("Roh-roh. Something went wrong. :(", e);
      }

      function _doneHandler(a, b, res) {
        var data = JSON.parse(res.responseText);

        if (res.status < 400) {
          profile.github.opts.sha = data.content.sha
          Notifier.showMessage(Notifier.messages.docSavedGithub + " as " + data.content.path);
        } else {
          Notifier.showMessage('An error occurred!');
        }
      } // end done handler

      function _alwaysHandler() {
        // close saving modal
        $('#modal-generic').modal('hide');
      }

      var postData = {
        uri: Github.getUri() || ""
      , data: btoa(editor.getSession().getValue())
      , name: profile.github.opts.name
      , sha: profile.github.opts.sha
      , branch: profile.github.opts.branch
      , repo: profile.github.opts.repo
      , owner: profile.github.opts.owner

      }

      var config = {
        type: 'POST'
      , data: postData
      , url: '/save/github'
      , error: _failHandler
      , success: _doneHandler
      }

      $.ajax(config)
    }, // end save
    bindNav: function() {
      $('#import_github')
        .on('click', function() {
          Github.fetchOrgs()
          return false
        })

      $("#save_github")
        .on('click', function() {
          Github.save()
          saveFile()
          return false
        })

    }

  } // end return obj

})() // end IIFE

Plugins.register(Github)
