var fs = require('fs')
  , path = require('path')
  , request = require('request')
  , url = require('url')

var githubConfigFile = path.resolve(__dirname, 'github-config.json')
  , githubConfig = {}
  , isConfigEnabled = false

// ^^^helps with the home page view; should we show the github dropdown?

if (fs.existsSync(githubConfigFile)) {
  githubConfig = require(githubConfigFile);
  isConfigEnabled = true;
} else if (process.env.github_client_id !== undefined) {
  githubConfig = {
    "client_id": process.env.github_client_id,
    "redirect_uri": process.env.github_redirect_uri,
    "client_secret": process.env.github_client_secret,
    "callback_url": process.env.github_callback_url
  };
  isConfigEnabled = true;
  console.log('Github config found in environment. Plugin enabled. (Key: "' + githubConfig.client_id +'")');
} else if (process.env.github_access_token !== undefined) {
  githubConfig = {
    "access_token": process.env.github_access_token
  };
  isConfigEnabled = true;
  console.log('Github config found in environment. Plugin enabled using a personal access_token.');
} else {
  githubConfig = {
    "client_id": "YOUR_ID"
  , "redirect_uri": "http://dillinger.io/"
  , "client_secret": "YOUR_SECRET"
  , "callback_url": "http://dillinger.io/oauth/github"
  }
  console.warn('Github config not found at ' + githubConfigFile + '. Plugin disabled.')
}

function arrayToRegExp(arr) {
  return new RegExp("(" + arr.map(function(e) { return e.replace('.','\\.'); }).join('|') + ")$", 'i');
}

exports.Github = (function() {

  var githubApi = 'https://api.github.com/'
    , headers = {
      "User-Agent": "X-Dillinger-App"
    }

  // String builder for auth url...
  function _buildAuthUrl() {
    return  'https://github.com/login/oauth/authorize?client_id='
            + githubConfig.client_id
            + '&scope=repo&redirect_uri='
            + githubConfig.callback_url
  }

  return {
    isConfigured: isConfigEnabled,
    githubConfig: githubConfig,
    generateAuthUrl: function(req, res) {
      return _buildAuthUrl()
    },
    getUsername: function(req, res, cb) {

      var uri = githubApi + 'user?access_token=' + req.session.github.oauth

      var options = {
        headers: headers
      , uri: uri
      }

      console.log('getting username from github')

      request(options, function(e, r, d) {
        if (e) {
          console.error(e)
          return res.redirect(r.statusCode)
        }
        else if (!e && r.statusCode === 200) {
          d = JSON.parse(d)
          req.session.github.username = d.login
          cb && cb()
        }
      }) // end request.get()

    }, // end getUsername
    fetchOrgs: function(req, res) {
      var uri = githubApi + 'user/orgs?access_token=' + req.session.github.oauth

      var options = {
        headers: headers
      , uri: uri
      }

      request(options, function(e, r, d) {
        if (e) {
          res.send({
            error: 'Request error.',
            data: r.statusCode
          })
        }
        else if (!e && r.statusCode == 200) {
          var set = []

          d = JSON.parse(d)

          d.forEach(function(el) {

            // Right now GitHub does not display a "Company Name" in user/orgs API route
            // Hopefully they will add it in later, for now use "login" name.

            var item = {
              url: el.url
            , name: el.login
            }

            set.push(item)
          })

          res.json(set)

        } // end else if
        else {
          res.json({ error: 'Unable to fetch organizations from Github.' })
        }
      }) // end request callback

    }, // end fetchOrgs

    fetchRepos: function(req, res) {

      var uri;

      if (req.body.owner !== req.session.github.username) {
        uri = githubApi + 'orgs/' + req.body.owner + '/repos?access_token=' + req.session.github.oauth
      }
      else {
        uri = githubApi + 'user/repos?access_token=' + req.session.github.oauth
      }

      if (isFinite(req.body.page) && +req.body.page > 1) {
        uri += "&page=" + req.body.page
      }

      var options = {
        headers: headers
      , uri: uri
      }

      request(options, function(e, r, d) {
        if (e) {
          res.send({
            error: 'Request error.',
            data: r.statusCode
          })
        }
        else if (!e && r.statusCode == 200) {
          var set = []

          d = JSON.parse(d)

          d.forEach(function(el) {

            var item = {
              url: el.url
            , name: el.name
            , private: el.private
            // future property we will need to pass so we can know whether we can "write" to repo
            //, permissions: el.permissions
            }

            set.push(item)
          })

          res.json(set)

        } // end else if
        else {
          res.json({ error: 'Unable to fetch repos from Github.' })
        }
      }) // end request callback
    }, // end fetchRepos
    fetchBranches: function(req, res) {

      var uri = githubApi
        + 'repos/'
        + req.body.owner
        + '/'
        + req.body.repo
        +'/branches?access_token=' + req.session.github.oauth

      var options = {
        headers: headers
      , uri: uri
      }

      request(options, function(e, r, d) {
        if (e) {
          res.send({
            error: 'Request error.'
          , d: r.statusCode
          })
        }
        else if (!e && r.statusCode === 200) {
          res.send(d)
        } // end else if
        else {
          res.json({ error: 'Unable to fetch branches from Github.' })
        }
      }) // end request callback

    }, // end fetchBranches
    fetchTreeFiles: function(req, res) {
      // /repos/:user/:repo/git/trees/:sha

      var uri, options, fileExts, regExp

      uri = githubApi
        + 'repos/'
        + req.body.owner
        + '/'
        + req.body.repo
        + '/git/trees/'
        + req.body.sha + '?recursive=1&access_token=' + req.session.github.oauth
        ;

      options = {
        headers: headers
      , uri: uri
      };

      fileExts = req.body.fileExts.split("|");
      regExp = arrayToRegExp(fileExts);

      request(options, function(e, r, d) {

        if (e) {
          res.send({
            error: 'Request error.'
          , data: r.statusCode
          })
        }
        else if (!e && r.statusCode === 200) {
          d = JSON.parse(d)
          d.branch = req.body.branch // inject branch info

          // overwrite d.tree to only return items that match regexp
          d.tree = d.tree.filter(function(item) { return regExp.test(item.path) });

          res.json(d)
        } // end else if
        else {
          res.json({ error: 'Unable to fetch files from Github.' })
        }
      }) // end request callback

    }, // end fetchTreeFiles
    fetchFile: function(req, res) {

      var uri = req.body.url
        , isPrivateRepo = /blob/.test(uri)

      // https://api.github.com/octocat/Hello-World/git/blobs/44b4fc6d56897b048c772eb4087f854f46256132
      // If it is a private repo, we need to make an API call, because otherwise it is the raw file.
      if (isPrivateRepo) {
        uri += '?access_token=' + req.session.github.oauth
      }

      var options = {
        headers: headers
      , uri: uri
      }

      request(options, function(e, r, d) {
        if (e) {
          console.error(e)

          res.send({
            error: 'Request error.'
          , data: r.statusCode
          })
        }
        else if (!e && r.statusCode === 200) {
          var jsonResp = {
            data: JSON.parse(d),
            error: false
          }

          if (isPrivateRepo) {
            d = JSON.parse(d)
            jsonResp.data.content = (new Buffer(d.content, 'base64').toString('ascii'))
          }

          res.json(jsonResp)

        } // end else if
        else {
          res.json({ error: 'Unable to fetch file from Github.' })
        }
      }) // end request callback

    }, // end fetchFile

    saveToGithub: function(req, res) {

      var data = req.body
      if (!data.uri) {
        res.json(400, { "error": "Requires Github URI" })
      }
      else {
        // uri = "https://api.github.com/repos/:owner/:repo/contents/:path"
        var
          commit, options, uri, owner,
          repo,   branch,  sha, message,
          isPrivateRepo;

        isPrivateRepo = /blob/.test(data.uri);

        branch  = data.branch;
        path    = data.path;
        sha     = data.sha;
        repo    = data.repo;
        owner   = data.owner;
        message = data.message;

        uri = githubApi + "repos/" + owner + '/' + repo + '/contents/' + path;
        uri += '?access_token=' + req.session.github.oauth;

        commit = {
          message: message // Better commit messages?
        , path: path
        , branch: branch
        , content: data.data
        , sha: sha
      };

        options = {
          headers: headers
        , uri: uri
        , method: "PUT"
        , body: JSON.stringify(commit)
        }

        request(options, function(e, r, d) {
          // 200 = Updated
          // 201 = Created
          if (!e && r.statusCode === 200 || r.statusCode === 201) {
            return res.json(200, JSON.parse(d))
          }
          return res.json(400, { "error": "Unable to save file: " + (e || JSON.parse(d).message) })

        })

      }
    }
  }

})()
