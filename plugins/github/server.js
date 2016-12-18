var express = require('express')
  , app = module.exports = express()
  , Github = require('./github.js').Github
  , request = require('request')
  , qs = require('querystring')
  , fs = require('fs')
  , path = require('path')

/* Github stuff */

var oauth_github_redirect = function(req, res) {

  // Create GitHub session object and stash for later.
  var uri;
  req.session.github = {};
  if (Github.githubConfig.access_token !== undefined) {
    req.session.github.oauth = Github.githubConfig.access_token;
    req.session.isGithubSynced = true;
    console.log('/')
    Github.getUsername(req, res,function() {
      res.redirect('/')
    });
  } else {
    req.session.github.oauth = {
      request_token: null,
      request_token_secret: null,
      access_token_secret: null,
      access_token: null
    }
    uri = Github.generateAuthUrl(req)
    res.redirect(uri)
  }
}

var oauth_github = function(req, res, cb) {
  if (!req.query.code) {
    cb();
  } else {

    var code = req.query.code
      , client_id = Github.githubConfig.client_id
      , redirect_uri = Github.githubConfig.redirect_uri
      , client_secret = Github.githubConfig.client_secret

    var params = '?code=' + code
                  + '&client_id=' + client_id
                  + '&redirect_url=' + redirect_uri
                  + '&client_secret=' + client_secret

    var uri = 'https://github.com/login/oauth/access_token'+params

    request.post(uri, function(err, resp, body) {
      // TODO: MAKE THIS MORE GRACEFUL
      if (err) res.send(err.message)
      else {
        // access_token=519e3f859210aa34265a52acb6b88290087f8996&scope=repo&token_type=bearer
        if (!req.session.github) {
          req.session.github = {
            oauth: null
          }
        }
        req.session.github.oauth = (qs.parse(body)).access_token
        req.session.github.scope = (qs.parse(body)).scope
        req.session.isGithubSynced = true
        console.log('about')
        Github.getUsername(req, res,function() {
          res.redirect('/')
        })

      }
    })

  } // end else
}

var unlink_github = function(req, res) {
  // Essentially remove the session for dropbox...
  delete req.session.github
  req.session.isGithubSynced = false
  res.redirect('/')
}

var import_github_orgs = function(req, res) {

  Github.fetchOrgs(req, res)

}

var import_github_repos = function(req, res) {

  Github.fetchRepos(req, res)

}

var import_github_branches = function(req, res) {

  Github.fetchBranches(req, res)

}

var import_tree_files = function(req, res) {

  Github.fetchTreeFiles(req, res)

}

var import_github_file = function(req, res) {

  Github.fetchFile(req, res)

}

var save_github = function(req, res) {

  Github.saveToGithub(req, res)

}

/* End Github stuff */

/* Begin Github */

app.get('/redirect/github', oauth_github_redirect);

app.get('/oauth/github', oauth_github);

app.get('/unlink/github', unlink_github);

// app.get('/account/github', account_info_github)

app.post('/import/github/orgs', import_github_orgs);

app.post('/import/github/repos', import_github_repos);

app.post('/import/github/branches', import_github_branches);

app.post('/import/github/tree_files', import_tree_files);

app.post('/import/github/file', import_github_file);

app.post('/save/github', save_github);

app.get('/js/github.js', function(req, res) {
  fs.readFile(path.join(__dirname, 'client.js'), 'utf8', function(err, data) {
    if (err) {
      res.send(500, "Sorry couldn't read file")
    }
    else {
      res.setHeader('content-type', 'text/javascript');
      res.send(200, data)
    }
  })
})

/* End Github */
