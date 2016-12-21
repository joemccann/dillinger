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
  console.log('Medium config found in environment. Plugin enabled. . (Key: "' + medium_config.client_id + '")')
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

      return mediumApp.getAuthorizationUrl('dillinger-secrets-are-insecure', medium_config.redirect_url, [
        mediumSdk.Scope.BASIC_PROFILE, mediumSdk.Scope.PUBLISH_POST
      ])

    },
    getUser: function(req, res, cb) {

      mediumApp.getUser(function getMediumUserCb(err,user){
        if(err) return cb(err)
        else return cb(null,user)
      })

    }, // end getUsername
    save: function(req, res){

      var title = req.body.title || 'New Unnamed Post'

      console.log(req.session.medium.userId)

      mediumApp.createPost({
        userId: req.session.medium.userId,
        title: title,
        contentFormat: mediumSdk.PostContentFormat.MARKDOWN,
        content: req.body.content,
        publishStatus: mediumSdk.PostPublishStatus.DRAFT
      }, function (err, post) {

        if(err){
          console.error(err.message)
          return res.json(400, err)
        }

        var p = post
        console.dir(p)
        return res.json(200, p)

      }) // end createPost

    } // end SaveToMedium
  } // end return object
})()
