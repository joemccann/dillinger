'use strict'

const fs = require('fs')
const path = require('path')
const mediumSdk = require('medium-sdk')

var mediumConfigFile = path.resolve(__dirname, '../../configs/medium/', 'medium-config.json')
var mediumConfig = {}
var isConfigEnabled = false

// ^^^helps with the home page view should we show the medium dropdown?
if (fs.existsSync(mediumConfigFile)) {
  mediumConfig = require(mediumConfigFile)
  isConfigEnabled = true
  console.log('Medium config found in environment. Plugin enabled.')
} else if (process.env.medium_client_id !== undefined) {
  mediumConfig = {
    client_id: process.env.medium_client_id,
    client_secret: process.env.medium_client_secret,
    callback_url: process.env.medium_callback_url,
    redirect_url: process.env.medium_redirect_url
  }
  isConfigEnabled = true
  console.log('Medium config found in environment. Plugin enabled.')
} else {
  mediumConfig = {
    client_id: 'YOUR_CLIENT_ID',
    client_secret: 'YOUR_SECRET',
    callback_url: 'YOUR_CALLBACK_URL',
    redirect_url: 'YOUR_REDIRECT_URL'
  }
  console.warn('Medium config not found at ' + mediumConfigFile + '. Plugin disabled.')
}

exports.Medium = (function () {
  var mediumApp = new mediumSdk.MediumClient({
    clientId: mediumConfig.client_id,
    clientSecret: mediumConfig.client_secret
  })

  return {
    mediumClient: mediumApp,
    isConfigured: isConfigEnabled,
    config: mediumConfig,
    generateAuthUrl: function (req, res, cb) {
      return mediumApp.getAuthorizationUrl('dillinger-secrets-are-insecure', mediumConfig.redirect_url, [
        mediumSdk.Scope.BASIC_PROFILE, mediumSdk.Scope.PUBLISH_POST
      ])
    },
    getUser: function (req, res, cb) {
      mediumApp.getUser(function getMediumUserCb (err, user) {
        if (err) return cb(err)
        else return cb(null, user)
      })
    }, // end getUsername
    setAccessTokenFromSession: function (token) {
      mediumApp.setAccessToken(token)
    },
    save: function (req, res) {
      var title = req.body.title || 'New Unnamed Post'

      mediumApp.createPost({
        userId: req.session.medium.userId,
        title: title,
        contentFormat: mediumSdk.PostContentFormat.MARKDOWN,
        content: req.body.content,
        publishStatus: mediumSdk.PostPublishStatus.DRAFT
      }, function (err, post) {
        if (err) {
          console.error(err.message)
          return res.status(400).json(err.message + ' Please unlink and relink your Medium account.')
        }

        return res.status(200).json(post)
      }) // end createPost
    } // end SaveToMedium
  } // end return object
})()
