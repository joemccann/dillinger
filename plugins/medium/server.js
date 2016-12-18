var express = require('express')
  , app = module.exports = express()
  , Medium = require('./medium.js').Medium
  , fs = require('fs')
  , path = require('path')

/* Medium Stuff */

// "http://dillinger.io/oauth/medium"
var oauth_medium_redirect = function(req, res) {
  
    // Create Medium session object and stash for later.
    var uri
    req.session.medium = {}
    
    req.session.medium.oauth = {
      token: null
    }
    uri = Medium.generateAuthUrl(req)
    res.redirect(uri)
  }

}

var oauth_medium = function(req, res, cb) {

  if (!req.query.code) { cb() } 
  else {
    req.session.oauth = {}

    var code = req.query.code
      , client_id = Medium.medium_config.client_id
      , redirect_url = Medium.medium_config.redirect_url
      , client_secret = Medium.medium_config.client_secret

    Medium.mediumClient.exchangeAuthorizationCode(code, redirect_url, function (err, token) {

        if(err)

        if (!req.session.medium) {
          req.session.medium = {
            oauth: null
          }
        }
        req.session.medium.oauth.token = token
        console.log('token: ' + token)
        client.getUser(function (err, user) {
          req.session.medium.userId  = user.id
          req.session.isMediumSynced = true
          res.redirect('/')
        }) // end getUser
    }) // end exchangeAuthorizationCode

  } // end else
}

var unlink_medium = function(req, res) {
  // Essentially remove the session for medium...
  delete req.session.medium
  req.session.isMediumSynced = false
  res.redirect('/')
}

var save_medium = function(req, res) { Medium.saveToMedium(req, res) }


/* End Medium stuff */

/* Begin Medium */

app.get('/redirect/medium', oauth_medium_redirect)

app.get('/oauth/medium', oauth_medium)

app.get('/unlink/medium', unlink_medium)

// app.get('/account/medium', account_info_medium)

app.post('/save/medium', save_medium)

app.get('/js/medium.js', function(req, res) {
  fs.readFile(path.join(__dirname, 'client.js'), 'utf8', function(err, data) {
    if (err) {
      res.send(500, "Sorry couldn't read file")
    }
    else {
      res.setHeader('content-type', 'text/javascript')
      res.send(200, data)
    }
  })
})
/* End Medium */
