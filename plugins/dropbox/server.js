var express = require('express')
  , app = module.exports = express()
  , Dropbox = require('./dropbox.js').Dropbox
  , fs = require('fs')
  , path = require('path')

/* Dropbox Stuff */

var oauth_dropbox_redirect = function(req, res) {
  Dropbox.getAuthUrl(req, res, function(url) {

    // Create dropbox session object and stash for later.
    req.session.dropbox = {}
    req.session.dropbox.oauth = {}

    res.redirect(url)

  })
}

var oauth_dropbox = function(req, res) {

    if (!req.session.dropbox) {
      console.log('No dropbox session - browser bug')
      req.session.dropbox = {}
      req.session.dropbox.oauth = {}
    }

    // We are now fetching the actual access token and stash in
    // session object values in callback.

    Dropbox.getRemoteAccessToken(req.query.code,
      function(status, access_token) {
          req.session.dropbox.oauthtoken = access_token
          req.session.isDropboxSynced = true

          // Check to see it works by fetching account info
          Dropbox.getAccountInfo(access_token, function(err, reply) {
            if (!err) {
              console.log("User %s is now authenticated.", reply.name.display_name)
            } else {
              console.log("Error retriving user details")
            }

          })

          // Now go back to home page with session data in tact.
          res.redirect('/')

    })  // end dbox.getRemoteAccessToken()
}

var unlink_dropbox = function(req, res) {
  // Essentially remove the session for dropbox...
  delete req.session.dropbox
  req.session.isDropboxSynced = false
  res.redirect('/')
}

var import_dropbox = function(req, res) {
  var postBody = req.body || {}

  Dropbox.searchForMdFiles({fileExts: postBody.fileExts}, function(status, data) {
    if (status === 401) return res.status(401).send("You are not authenticated with Dropbox. Please unlink and link again.")
    if (status > 399) return res.status(status).send("Something went wrong. Please refresh.")
    return res.json(data)
  })

}

var fetch_dropbox_file = function(req, res) { Dropbox.fetchDropboxFile(req, res) }

var save_dropbox = function(req, res) { Dropbox.saveFileToDropbox(req, res) }

var save_dropbox_image = function (req,res) { Dropbox.saveImageToDropbox(req, res) }

/* End Dropbox stuff */

/* Begin Dropbox */

app.get('/redirect/dropbox', oauth_dropbox_redirect);

app.get('/oauth/dropbox', oauth_dropbox);

app.get('/unlink/dropbox', unlink_dropbox);

app.post('/import/dropbox', import_dropbox);

// app.get('/account/dropbox', account_info_dropbox)

app.post('/fetch/dropbox', fetch_dropbox_file);

app.post('/save/dropbox', save_dropbox);

app.post('/save/dropbox/image', save_dropbox_image);

app.get('/js/dropbox.js', function(req, res) {
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
/* End Dropbox */
