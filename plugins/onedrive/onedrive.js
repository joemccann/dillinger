var fs = require('fs')
  , path = require('path')
  , util = require('util')
  , request = require('request');

var configFile = path.resolve(__dirname, 'onedrive-config.json')
  , config = {}
  , scopes = ['wl.basic', 'wl.skydrive_update']
  , isConfigEnabled = false
  , client = null;

if (fs.existsSync(configFile)) {
  config = require(configFile);
  isConfigEnabled = true;
} else if(process.env.onedrive_client_id !== undefined) {
  config = {
    "client_id": process.env.onedrive_client_id,
    "client_secret": process.env.onedrive_client_secret,
    "redirect_uri": process.env.onedrive_redirect_uri
  };

  isConfigEnabled = true;
  console.log('OneDrive config found in environment. Plugin enabled. (Key: "' + config.client_id + '")');

} else {
  config = {
    "client_id": "CLIENT_ID"
  , "client_secret": "CLIENT_SECRET"
  , "redirect_uri": "http://dillinger.io/"};
  console.warn('OneDrive config not found at ' + configFile +
      '. Plugin disabled.')
}

var OneDrive = {
  isConfigured: isConfigEnabled,
  generateAuthUrl: function() {
    return encodeURI(util.format("https://login.live.com/oauth20_authorize.srf?client_id=%s&" +
      "scope=%s&response_type=code&redirect_uri=%s", config.client_id, scopes.join(" "),
      config.redirect_uri));
  },
  getToken: function(code, callback) {
    request.post({
      url: 'https://login.live.com/oauth20_token.srf',
      form: {
        'client_id': config.client_id,
        'redirect_uri': config.redirect_uri,
        'client_secret': config.client_secret,
        'code': code,
        'grant_type': 'authorization_code'
      }
    }, function(err, res, body) {
      callback(err, (err) ? err : JSON.parse(body));
    });
  },
  search: function(tokens, callback) {
    request.get({
      uri: 'https://apis.live.net/v5.0/me/skydrive/search',
      qs: {
        'q': 'md',
        'access_token': tokens.access_token
      }
    }, function(err, res, body) {
      callback(err, (err) ? null : JSON.parse(body));
    })
  },
  get: function(tokens, fileId, callback) {
    request.get({
      uri: 'https://apis.live.net/v5.0/' + fileId + '/content',
      qs: {
        'access_token': tokens.access_token
      }
    }, function(err, res, body) {
      callback(err, {
        content: body
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

  }
};

exports.OneDrive = OneDrive;
