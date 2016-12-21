'use strict'

var path = require('path')
  , request = require('request')
  , qs = require('querystring')
  , Dropbox = require( path.resolve(__dirname, '../plugins/dropbox/dropbox.js') ).Dropbox
  , Github = require( path.resolve(__dirname, '../plugins/github/github.js') ).Github
  , Medium = require( path.resolve(__dirname, '../plugins/medium/medium.js') ).Medium
  , GoogleDrive = require('../plugins/googledrive/googledrive.js').GoogleDrive
  , OneDrive = require('../plugins/onedrive/onedrive.js').OneDrive
  , Sponsored = require('../plugins/sponsored/sponsored.js')
  , GoogleAnalytics = require('../plugins/googleanalytics/googleanalytics.js')
  ;

// Show the home page
exports.index = function(req, res) {

  // Some flags to be set for client-side logic.
  var indexConfig = {
    isDropboxAuth: !!req.session.isDropboxSynced,
    isGithubAuth: !!req.session.isGithubSynced,
    isMediumAuth: !!req.session.isMediumSynced,
    isEvernoteAuth: !!req.session.isEvernoteSynced,
    isGoogleDriveAuth: !!req.session.isGoogleDriveSynced,
    isOneDriveAuth: !!req.session.isOneDriveSynced,
    isDropboxConfigured: Dropbox.isConfigured,
    isGithubConfigured: Github.isConfigured,
    isMediumConfigured: Medium.isConfigured,
    isGoogleDriveConfigured: GoogleDrive.isConfigured,
    isOneDriveConfigured: OneDrive.isConfigured,
    isSponsoredConfigured: Sponsored.isConfigEnabled,
    isGoogleAnalyticsConfigured: GoogleAnalytics.isConfigEnabled
  }

  // Capture github username for the future...
  if (req.session.github && req.session.github.username) indexConfig.github_username = req.session.github.username

  // If GA is enabled, let's create the HTML and tracking
  if (GoogleAnalytics.isConfigEnabled){
    indexConfig.GATrackSponsoredLinksHTML = GoogleAnalytics.generateTrackSponsoredLinkClicks()
    indexConfig.GATrackingHTML = GoogleAnalytics.generateGATrackingJS()
  }

  // Check for Medium bits...
  if (req.session.medium && req.session.medium.oauth 
      && req.session.medium.oauth.token && req.session.medium.oauth.token.access_token) {
    console.log(req.session.medium.oauth.token.access_token + " is the Medium access token")
    // Set the access token on the medium client
    Medium.setAccessTokenFromSession(req.session.medium.oauth.token.access_token)
  }else
  {
    console.log("No Medium Session.")
    req.session.isMediumSynced = false
  }

  // If Sponsored ads is enabled get the ad HTML
  if(Sponsored.isConfigEnabled){
    Sponsored.fetchAd(function createAdCb(json){
      indexConfig.adHTML = Sponsored.generateAdHTML(json)
      return res.render('index', indexConfig)
    })
  }
  else{
    return res.render('index', indexConfig)    
  }

}

// Show the not implemented yet page
exports.not_implemented = function(req, res) {
  res.render('not-implemented')
}
