var express = require('express')
  , app = module.exports = express()
  , Dropbox = require('./dropbox.js').Dropbox
  , fs = require('fs')
  , path = require('path')

/* Dropbox Stuff */

var oauth_dropbox_redirect = function(req, res) {
  Dropbox.getNewRequestToken(req, res, function(status, request_token) {

    var dropbox_auth_url = Dropbox.config.auth_url +
                    "?oauth_token=" + request_token.oauth_token +
                    "&oauth_callback=" +
                    Dropbox.config.callback_url

    console.log(dropbox_auth_url + " is the auth_url for dropbox")

    // Create dropbox session object and stash for later.
    req.session.dropbox = {}
    req.session.dropbox.oauth = {
      request_token: request_token.oauth_token,
      request_token_secret: request_token.oauth_token_secret,
      access_token_secret: null,
      access_token: null
    }

    res.redirect(dropbox_auth_url)

  })
}

var oauth_dropbox = function(req, res) {

  // console.dir(req.query)

    if (!req.session.dropbox) {
      console.log('No dropbox session - browser bug')
      req.session.dropbox = {}
      req.session.dropbox.oauth = {}
    }

    // Create dropbox session object and stash for later.
    req.session.dropbox.oauth.access_token_secret = null
    req.session.dropbox.oauth.access_token = null

    // We are now fetching the actual access token and stash in
    // session object values in callback.
    Dropbox.getRemoteAccessToken(
      req.session.dropbox.oauth.request_token,
      req.session.dropbox.oauth.request_token_secret,
      function(status, access_token) {

          req.session.dropbox.oauth.access_token_secret = access_token.oauth_token_secret
          req.session.dropbox.oauth.access_token = access_token.oauth_token
          req.session.dropbox.uid = access_token.uid
          req.session.isDropboxSynced = true

          // Check to see it works by fetching account info
          Dropbox.getAccountInfo(req.session.dropbox, function(status, reply) {

            console.log('Got account info!')
            console.log(reply)
            console.log("User %s is now authenticated.", reply.display_name )
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

  Dropbox.searchForMdFiles({ dropboxObj: req.session.dropbox, fileExts: postBody.fileExts }, function(status, data) {
    console.log(status)
    if (status === 401) return res.status(401).send("You are not authenticated with Dropbox. Please unlink and link again.")
    if (status > 399) return res.status(status).send("Something went wrong. Please refresh.")
    return res.json(data)
  })

}

var fetch_dropbox_file = function(req, res) {

  Dropbox.fetchDropboxFile(req, res)

}

var save_dropbox = function(req, res) {

  Dropbox.saveToDropbox(req, res)

}

/* End Dropbox stuff */

/* Begin Dropbox */

app.get('/redirect/dropbox', oauth_dropbox_redirect);

app.get('/oauth/dropbox', oauth_dropbox);

app.get('/unlink/dropbox', unlink_dropbox);

app.post('/import/dropbox', import_dropbox);

// app.get('/account/dropbox', account_info_dropbox)

app.post('/fetch/dropbox', fetch_dropbox_file);

app.post('/save/dropbox', save_dropbox);

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
