'use strict'

var path = require('path')
  , request = require('request')
  , qs = require('querystring')
  , Dropbox = require( path.resolve(__dirname, '../plugins/dropbox/dropbox.js') ).Dropbox
  , Github = require( path.resolve(__dirname, '../plugins/github/github.js') ).Github
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
    isEvernoteAuth: !!req.session.isEvernoteSynced,
    isGoogleDriveAuth: !!req.session.isGoogleDriveSynced,
    isOneDriveAuth: !!req.session.isOneDriveSynced,
    isDropboxConfigured: Dropbox.isConfigured,
    isGithubConfigured: Github.isConfigured,
    isGoogleDriveConfigured: GoogleDrive.isConfigured,
    isOneDriveConfigured: OneDrive.isConfigured,
    isSponsoredConfigured: Sponsored.isConfigEnabled,
    isGoogleAnalyticsConfigured: GoogleAnalytics.isConfigEnabled
  }

  if (!req.session.isEvernoteSynced) {
    console.warn('Evernote not implemented.')
  }

  if (req.session.github && req.session.github.username) indexConfig.github_username = req.session.github.username

  // If GA is enabled, let's create the HTML and tracking
  if (GoogleAnalytics.isConfigEnabled){
    indexConfig.GATrackLinksHTML = GoogleAnalytics.generateTrackLinkClicks()
    indexConfig.GATrackingHTML = GoogleAnalytics.generateGATrackingJS()
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
