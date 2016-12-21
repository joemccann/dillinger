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


var oauth_medium = function(req, res, cb) {

  if (!req.query.code) { cb() } 
  else {
    req.session.oauth = {}

    var code = req.query.code
      , client_id = Medium.config.client_id
      , redirect_url = Medium.config.redirect_url
      , client_secret = Medium.config.client_secret
      ;

    Medium.mediumClient.exchangeAuthorizationCode(code, redirect_url, function (err, token) {

      // Fix this...this is bad for the user...
        if(err) return console.error(err.message)

        if (!req.session.medium) {
          req.session.medium = {
            oauth: null
          }
        }
        req.session.medium.oauth.token = token
        
        Medium.mediumClient.getUser(function (err, user) {
          if(err) {
            // something went wrong
            console.error(err.message)
            unlink_medium(req, res)
            return res.send(err.message)
          }
          else{
            req.session.medium.userId  = user.id
            req.session.isMediumSynced = true
            res.redirect('/')            
          }
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

var save_medium = function(req, res) { 

  if (!req.session.medium) {
    res.status(401).send('Medium is not linked.');
    return;
  }

  if(req.session.isMediumSynced) Medium.save(req,res)
  else res.redirect('/redirect/medium/')

}

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
