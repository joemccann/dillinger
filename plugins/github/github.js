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

      console.log('getting username from github: ' + uri)

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
    fetchRepos: function(req, res) {

      var uri = githubApi + 'user/repos?access_token=' + req.session.github.oauth

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
        + req.session.github.username
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

      var uri = githubApi
        + 'repos/'
        + req.session.github.username
        + '/'
        + req.body.repo
        + '/git/trees/'
        + req.body.sha + '?recursive=1&access_token=' + req.session.github.oauth

      var options = {
        headers: headers
      , uri: uri
      }

      request(options, function(e, r, d) {
        if (e) {
          res.send(
            {
              error: 'Request error.'
            , data: r.statusCode
            })
        }
        else if (!e && r.statusCode === 200) {
          d = JSON.parse(d)
          res.json(d)
        } // end else if
        else {
          res.json({ error: 'Unable to fetch files from Github.' })
        }
      }) // end request callback

    }, // end fetchTreeFiles
    fetchFile: function(req, res) {

      var uri = req.body.mdFile
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

      console.dir(options)

      request(options, function(e, r, d) {
        if (e) {
          console.error(e)

          res.send({
            error: 'Request error.'
          , data: r.statusCode
          })
        }
        else if (!e && r.statusCode === 200) {

          var json_resp = {
            data: d
          , error: false
          }

          if (isPrivateRepo) {
            d = JSON.parse(d)
            json_resp.data = (new Buffer(d.content, 'base64').toString('ascii'))
          }

          res.json(json_resp)

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
        var options, parseUrl, uri, repo, branch, sha

        parseUrl = url.parse(data.uri).path.split("/")

        branch = parseUrl[3]
        repo = parseUrl[2]
        path = parseUrl.slice(4).join("/")

        uri = githubApi + "repos/" + req.session.github.username + '/' + repo + '/contents/' + path

        uri += '?access_token=' + req.session.github.oauth

        options = {
          headers: headers
        , uri: uri
        }

        request(options, function(_, __, dd) {
          var options, commit

          sha = JSON.parse(dd).sha

          console.log("The sha is ", sha)

          commit = {
            message: "Modified file using Dillinger" // Better commit messages?
          , path: parseUrl.slice(4).join("/")
          , branch: parseUrl[3]
          , content: data.data
          , sha: sha
          }

          options = {
            headers: headers
          , uri: uri
          , method: "PUT"
          , body: JSON.stringify(commit)
          }

          request(options, function(e, r, d) {
            if (!e && r.statusCode === 200) {
              return res.json(200, d)

            }
            return res.json(400, { "error": "Unable to save file " + e })
          })
        })

        res.json(200, { "uri": data.uri })
      }
    }
  }

})()

