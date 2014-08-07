var path = require('path')
  , request = require('request')
  , qs = require('querystring')
  , Core = require( path.resolve(__dirname, '../plugins/core/core.js') ).Core
  , Dropbox = require( path.resolve(__dirname, '../plugins/dropbox/dropbox.js') ).Dropbox
  , Github = require( path.resolve(__dirname, '../plugins/github/github.js') ).Github
  , GoogleDrive = require('../plugins/googledrive/googledrive.js').GoogleDrive

// Show the home page
exports.index = function(req, res) {

  // Some flags to be set for client-side logic.
  var indexConfig = {
    isDropboxAuth: !!req.session.isDropboxSynced,
    isGithubAuth: !!req.session.isGithubSynced,
    isEvernoteAuth: !!req.session.isEvernoteSynced,
    isGoogleDriveAuth: !!req.session.isGoogleDriveSynced,
    isDropboxConfigured: Dropbox.isConfigured,
    isGithubConfigured: Github.isConfigured,
    isGoogleDriveConfigured: GoogleDrive.isConfigured
  }

  if (!req.session.isEvernoteSynced) {
    console.warn('Evernote not implemented yet.')
  }

  if (req.session.github && req.session.github.username) indexConfig.github_username = req.session.github.username
  return res.render('index', indexConfig)

}

// Show the not implemented yet page
exports.not_implemented = function(req, res) {
  res.render('not-implemented')
}

/* Core stuff */

exports.fetch_md = Core.fetchMd
exports.download_md = Core.downloadMd
exports.fetch_html = Core.fetchHtml
exports.fetch_html_direct = Core.fetchHtmlDirect
exports.download_html = Core.downloadHtml
exports.fetch_pdf = Core.fetchPdf
exports.download_pdf = Core.downloadPdf

/* End Core stuff */

/* Google Drive stuff */

function handle_googledrive_response(req, res, err, fn) {
  if (err) {
    if (err.code == 401 || err.code == 403) {
      req.session.googledrive = null;
      req.session.isGoogleDriveSynced = false;
    }
    res.status(err.code || 400).send('Error: ' + err.message);
  } else {
    fn(req, res);
  }
}

exports.oauth_googledrive_redirect = function(req, res) {
  res.redirect(GoogleDrive.generateAuthUrl());
}

exports.oauth_googledrive = function(req, res, next) {
  var code = req.query.code;
  GoogleDrive.getToken(code, function(err, tokens) {
    if (!err) {
      req.session.isGoogleDriveSynced = true;
      req.session.googledrive = tokens;
    }
    res.redirect('/');
  });
}

exports.unlink_googledrive = function(req, res) {
  req.session.googledrive = null;
  req.session.isGoogleDriveSynced = false;
  res.redirect('/');
}

exports.import_googledrive = function(req, res) {
  if (!req.session.googledrive) {
    res.status(401).send('Google Drive is not linked.');
    return;
  }
  var tokens = req.session.googledrive;
  GoogleDrive.search(tokens, function(err, data) {
    handle_googledrive_response(req, res, err, function() {
      res.json(data);
    });
  });
}

exports.fetch_googledrive_file = function(req, res) {
  if (!req.session.googledrive) {
    res.status(401).send('Google Drive is not linked.');
    return;
  }
  var fileId = req.query.fileId
    , tokens = req.session.googledrive;
  GoogleDrive.get(tokens, fileId, function(err, response) {
    handle_googledrive_response(req, res, err, function() {
      res.json(response);
    });
  });
}

exports.save_googledrive = function(req, res) {
  if (!req.session.googledrive) {
    res.status(401).send('Google Drive is not linked.');
    return;
  }
  var fileId = req.query.fileId
    , content = req.body.content
    , title = req.body.title
    , tokens = req.session.googledrive;
  GoogleDrive.save(tokens, fileId, title, content, function(err, data) {
    handle_googledrive_response(req, res, err, function() {
      res.send(data);
    });
  });
}

/* End of Google Drive stuff */
