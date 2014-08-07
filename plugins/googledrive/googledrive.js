var fs = require('fs')
  , path = require('path')
  , googleapis = require('googleapis')
  , request = require('request');

var configFile = path.resolve(__dirname, 'googledrive-config.json')
  , config = {}
  , scopes = ['https://www.googleapis.com/auth/drive']
  , isConfigEnabled = false
  , client = null;

if (fs.existsSync(configFile)) {
  config = require(configFile);
  isConfigEnabled = true;
} else if(process.env.googledrive_client_id !== undefined) {
  config = {
    "client_id": process.env.googledrive_client_id,
    "client_secret": process.env.googledrive_client_secret,
    "redirect_uri": process.env.googledrive_redirect_uri
  };

  isConfigEnabled = true;
  console.log('Google Drive config found in environment. Plugin enabled. (Key: "' + config.client_id + '")');

} else {
  config = {
    "client_id": "CLIENT_ID"
  , "client_secret": "CLIENT_SECRET"
  , "redirect_uri": "http://dillinger.io/"};
  console.warn('Google Drive config not found at ' + configFile +
      '. Plugin disabled.')
}

var GoogleDrive = {
  isConfigured: isConfigEnabled,
  _loadDriveIfRequired: function(callback) {
    if (!client) {
      googleapis.discover('drive', 'v2').execute(function(err, c) {
        client = c;
        callback();
      });
    } else {
      callback();
    }
  },
  generateAuthUrl: function() {
    var oauth2Client = new googleapis.auth.OAuth2Client(
        config.client_id, config.client_secret, config.redirect_uri);
    return oauth2Client.generateAuthUrl({ scope: scopes.join(' ') });
  },
  getToken: function(code, callback) {
    var oauth2Client = new googleapis.auth.OAuth2Client(
        config.client_id, config.client_secret, config.redirect_uri);
    oauth2Client.getToken(code, callback);
  },
  search: function(tokens, callback) {
    this._loadDriveIfRequired(function() {
      var oauth2Client = new googleapis.auth.OAuth2Client(
        config.client_id, config.client_secret, config.redirect_uri);
      oauth2Client.credentials = tokens;
      client
        .drive.files.list({ q: 'mimeType = "text/x-markdown" and trashed = false' })
        .withAuthClient(oauth2Client).execute(function(err, results) {
          // TODO: handle pagination
          callback && callback(err, results);
        });
      });
  },
  get: function(tokens, fileId, callback) {
    var that = this;
    this._loadDriveIfRequired(function() {
      var oauth2Client = new googleapis.auth.OAuth2Client(
        config.client_id, config.client_secret, config.redirect_uri);

      oauth2Client.credentials = tokens;
      client
        .drive.files.get({ fileId: fileId })
        .withAuthClient(oauth2Client).execute(function(err, result) {
          if (err) {
            callback(err, null);
          } else {
            that._getContents(tokens, result.downloadUrl, function(err, data) {
              callback(err, { title: result.title, content: data });
            });
          }
        });
      });
  },
  save: function(tokens, fileId, title, content, callback) {
    // TODO: remove native call when googleapis support media uploads
    content = content || '';
    title = title || 'Untitled.md';

    var boundaryTag = 'a_unique_boundary_tag';
    var body = '--' + boundaryTag + '\n' +
               'Content-Type: application/json; charset=UTF-8\n\n' +
               JSON.stringify({ title: title }) + '\n\n' +
               '--' + boundaryTag + '\n' +
               'Content-Type: text/x-markdown\n\n' +
               content + '\n\n' +
               '--' + boundaryTag + '--';

    var uploadUrl = 'https://www.googleapis.com/upload/drive/v2/files'
      , method = 'post';

    if (fileId) {
      uploadUrl += '/' + fileId;
      method = 'put';
    }

    request({
      uri: uploadUrl + '?uploadType=multipart',
      body: body,
      method: method,
      headers: {
        'Authorization': 'Bearer ' + tokens.access_token,
        'Content-type': 'multipart/related; boundary="' + boundaryTag + '"'
      }
    }, function(err, res, body) {
      callback(err, body);
    });

  },
  _getContents: function(tokens, url, callback) {
    request({
      uri: url,
      headers: {
        'Authorization': 'Bearer ' + tokens.access_token
      }
    }, function(err, res, body) {
      callback(err, body);
    });
  }
};

exports.GoogleDrive = GoogleDrive;
