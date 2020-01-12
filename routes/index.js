'use strict'

const path = require('path')
const Dropbox = require(path.resolve(__dirname, '../plugins/dropbox/dropbox.js')).Dropbox
const Bitbucket = require(path.resolve(__dirname, '../plugins/bitbucket/bitbucket.js')).Bitbucket
const Github = require(path.resolve(__dirname, '../plugins/github/github.js')).Github
const Medium = require(path.resolve(__dirname, '../plugins/medium/medium.js')).Medium
const GoogleDrive = require('../plugins/googledrive/googledrive.js').GoogleDrive
const OneDrive = require('../plugins/onedrive/onedrive.js').OneDrive
const Sponsored = require('../plugins/sponsored/sponsored.js')
const GoogleAnalytics = require('../plugins/googleanalytics/googleanalytics.js')

// Show the home page
exports.index = function (req, res) {
  // Some flags to be set for client-side logic.
  const indexConfig = {
    isDropboxAuth: !!req.session.isDropboxSynced,
    isBitbucketAuth: !!req.session.isBitbucketSynced,
    isGithubAuth: !!req.session.isGithubSynced,
    isMediumAuth: !!req.session.isMediumSynced,
    isEvernoteAuth: !!req.session.isEvernoteSynced,
    isGoogleDriveAuth: !!req.session.isGoogleDriveSynced,
    isOneDriveAuth: !!req.session.isOneDriveSynced,
    isDropboxConfigured: Dropbox.isConfigured,
    isBitbucketConfigured: Bitbucket.isConfigured,
    isGithubConfigured: Github.isConfigured,
    isMediumConfigured: Medium.isConfigured,
    isGoogleDriveConfigured: GoogleDrive.isConfigured,
    isOneDriveConfigured: OneDrive.isConfigured,
    isSponsoredConfigured: Sponsored.key,
    isGoogleAnalyticsConfigured: GoogleAnalytics.isConfigEnabled
  }

  // Capture Bitbucket username for the future...
  if (req.session.bitbucket && req.session.bitbucket.username) {
    indexConfig.bitbucket_username = req.session.bitbucket.username
  } else indexConfig.isBitbucketAuth = false

  // Capture GitHub username for the future...
  if (req.session.github && req.session.github.username) {
    indexConfig.github_username = req.session.github.username
  }

  // If GA is enabled, let's create the HTML and tracking
  if (GoogleAnalytics.isConfigEnabled) {
    indexConfig.GATrackSponsoredLinksHTML = GoogleAnalytics
      .generateTrackSponsoredLinkClicks()
    indexConfig.GATrackingHTML = GoogleAnalytics.generateGATrackingJS()
  }

  // Check for Medium bits...
  if (req.session.medium && req.session.medium.oauth &&
    req.session.medium.oauth.token &&
    req.session.medium.oauth.token.access_token) {
    // Set the access token on the medium client
    Medium
      .setAccessTokenFromSession(req.session.medium.oauth.token.access_token)
  } else {
    req.session.isMediumSynced = false
  }

  return res.render('index', indexConfig)
}

exports.privacy = function (req, res) {
  res.sendFile(path.resolve(__dirname, '..', 'public/privacy.html'))
}

// Show the not implemented yet page
exports.not_implemented = function (req, res) {
  res.render('not-implemented')
}
