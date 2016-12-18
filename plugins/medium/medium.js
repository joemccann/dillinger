"use strict"

const fs = require('fs')
  , path = require('path')
  , request = require('request')
  , mediumSdk = require('medium-sdk')
  , url = require('url')
  ;

var medium_config_file = path.resolve(__dirname, '../../configs/medium/', 'medium-config.json')
  , medium_config = {}
  , isConfigEnabled = false
  ;

// ^^^helps with the home page view should we show the medium dropdown?
if ( fs.existsSync(medium_config_file) ) {
  medium_config = require(medium_config_file)
  isConfigEnabled = true
} else if (process.env.medium_client_id !== undefined) {
  medium_config = {
    "client_id": process.env.medium_client_id,
    "client_secret": process.env.medium_client_secret,
    "callback_url": process.env.medium_callback_url,
    "redirect_url": process.env.medium_redirect_url
  }
  isConfigEnabled = true
  console.log('Medium config found in environment. Plugin enabled. (Key: "' + medium_config.client_id + '")')
} else {
  medium_config = {
    "client_id": "YOUR_CLIENT_ID"
  , "client_secret": "YOUR_SECRET"
  , "callback_url": "YOUR_CALLBACK_URL"
  , "redirect_url": "YOUR_REDIRECT_URL"
  }
  console.warn('Medium config not found at ' + medium_config_file + '. Plugin disabled.')
}

exports.Medium = (function() {

  var mediumApp = new mediumSdk.MediumClient({
    clientId: medium_config.client_id,
    clientSecret: medium_config.client_secret
  })

  return {
    mediumClient: mediumApp,
    isConfigured: isConfigEnabled,
    config: medium_config,
    generateAuthUrl: function(req, res, cb) {

      return mediumApp.getAuthorizationUrl('secretState', medium_config.callback_url, [
        mediumSdk.Scope.BASIC_PROFILE, mediumSdk.Scope.PUBLISH_POST, "uploadImage"
      ])

    },
    getUser: function(req, res, cb) {

      mediumApp.getUser(function getMediumUserCb(err,user){
        if(err) return cb(err)
        else return cb(null,user)
      })

    }, // end getUsername
    saveToMedium: function(req, res){

      var postData = req.body.data
        , title = req.body.title
        ;

      mediumApp.createPost({
        userId: req.session.medium.userId,
        title: title,
          contentFormat: medium.PostContentFormat.MARKDOWN,
          content: postData,
          publishStatus: medium.PostPublishStatus.DRAFT
        }, function (err, post) {
          console.log(token, user, post)

          if (!err) {
            var p = JSON.parse(post)
            console.dir(p)
            return res.json(200, p)
          }
          return res.json(400, { "error": "Unable to post to Medium: " + (err)})

      }) // end createPost

    } // end SaveToMedium
  } // end return object
})()

var test = exports.Medium
test.getAuthorizationUrl()