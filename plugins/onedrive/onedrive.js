var fs = require('fs')
  , path = require('path')
  , util = require('util')
  , request = require('request');

var configFile = path.resolve(__dirname, '../../configs/onedrive/', 'onedrive-config.json')
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
      // One Drive doesn't respond with a name.
      callback(err, {
        content: body
      });
    });
  },
  save: function(tokens, fileId, title, content, callback) {
    content = content || '';
    title = title || 'Untitled.md';

    var uploadUrl = 'https://apis.live.net/v5.0/me/skydrive/files/' + title;
    request({
      uri: uploadUrl,
      qs: {
        'access_token': tokens.access_token
      },
      body: content,
      method: "put"
    }, function(err, res, body) {
      callback(err, body);
    });
  }
};

exports.OneDrive = OneDrive;
