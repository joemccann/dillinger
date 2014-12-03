var fs = require('fs')
  , path = require('path')
  , request = require('request')
  , dbox = require('dbox')
  , qs = require('querystring')
  , url = require('url')
  , parallel = require('./parallel')
  ;

var dropbox_config_file = path.resolve(__dirname, 'dropbox-config.json')
  , dropbox_config = {}
  , isConfigEnabled = false
  ;
// ^^^helps with the home page view; should we show the dropbox dropdown?

if (fs.existsSync(dropbox_config_file)) {
  dropbox_config = require(dropbox_config_file);
  isConfigEnabled = true;
} else if (process.env.dropbox_app_key !== undefined) {
  dropbox_config = {
    "app_key": process.env.dropbox_app_key,
    "app_secret": process.env.dropbox_app_secret,
    "callback_url": process.env.dropbox_callback_url,
    "auth_url": "https://www.dropbox.com/1/oauth/authorize",
    "request_token_url": "https://api.dropbox.com/1/oauth/request_token",
    "access_token_url": "https://api.dropbox.com/1/oauth/access_token",
    "collections_url": "https://api-content.dropbox.com/1"
  };
  isConfigEnabled = true;
  console.log('Dropbox config found in environment. Plugin enabled. (Key: "' + dropbox_config.app_key + '")');
} else {
  dropbox_config = {
    "app_key": "YOUR_KEY"
  , "app_secret": "YOUR_SECRET"
  , "callback_url": "YOUR_CALLBACK_URL"
  , "auth_url": "https://www.dropbox.com/1/oauth/authorize"
  , "request_token_url": "https://api.dropbox.com/1/oauth/request_token"
  , "access_token_url": "https://api.dropbox.com/1/oauth/access_token"
  , "collections_url": "https://api-content.dropbox.com/1"
  };
  console.warn('Dropbox config not found at ' + dropbox_config_file + '. Plugin disabled.');
}

exports.Dropbox = (function() {

  var dboxapp = dbox.app({
    "app_key": dropbox_config.app_key
  , "app_secret": dropbox_config.app_secret
  , "root": "dropbox"
  });

  function arrayToRegExp(arr) {
    return new RegExp("(" + arr.map(function(e) { return e.replace('.','\\.'); }).join('|') + ")$", 'i');
  }

  return {
    isConfigured: isConfigEnabled,
    config: dropbox_config,
    getNewRequestToken: function(req, res, cb) {

      // Create your auth_url for the view
      dboxapp.requesttoken(function(status, request_token){

        return cb(status, request_token);

      });

    },
    getRemoteAccessToken: function(request_token, request_token_secret, cb) {

      var req_token = { oauth_token: request_token, oauth_token_secret: request_token_secret };

      dboxapp.accesstoken(req_token, function(status, access_token){
        return cb(status, access_token)
      })

    }, // end getRemoteAccessToken()
    getAccountInfo: function(dropboxObj, cb) {
      var access_token = { oauth_token: dropboxObj.oauth.access_token, oauth_token_secret: dropboxObj.oauth.access_token_secret };

      var dboxclient = dboxapp.client(access_token)

      dboxclient.account(function(status, reply) {
        return cb(status, reply)
      })

    }, // end getAccountInfo()
    fetchDropboxFile: function(req, res) {

      if (!req.session.isDropboxSynced) {
        res.type('text/plain')
        return res.status(403).send("You are not authenticated with Dropbox.")
      }

      var access_token = {
        oauth_token : req.session.dropbox.oauth.access_token,
        oauth_token_secret : req.session.dropbox.oauth.access_token_secret
      }

      var dboxclient = dboxapp.client(access_token)

      var pathToMdFile = req.body.mdFile

      dboxclient.get(pathToMdFile, function(status, reply, metadata) {

        // https://github.com/joemccann/dillinger/issues/64
        // In case of an empty file...
        reply = reply ? reply.toString() : ''

        return res.json({data: reply.toString()})

      })

    },
    searchForMdFiles: function(opts, cb) {

      // *sigh* http://forums.dropbox.com/topic.php?id=50266&replies=1

      var dropboxObj = opts.dropboxObj
        , fileExts = opts.fileExts.split('|')
        , regExp = arrayToRegExp(fileExts)
        , access_token = { oauth_token: dropboxObj.oauth.access_token, oauth_token_secret: dropboxObj.oauth.access_token_secret }
        , dboxclient = dboxapp.client(access_token)
        , options, batches, cbFilter
        ;

      options = {
        file_limit: 500
      , include_deleted: false
      }

      cbFilter = function(_cb) {
        return function(status, reply) {
          var files = []
          if (status > 399 || !reply) {
            return _cb(new Error('Bad response.'))
          }

          reply.forEach(function(item) {
            if (regExp.test(item.path)) {
              files.push(item)
            }
          })

          _cb(null, files)
        }
      }

      // generate a new dropbox search per file extension
      batches = fileExts.map(function(ext) {
        return function(_cb) {
          dboxclient.search("/", ext, options, cbFilter(_cb))
        }
      })

      parallel(batches, function(err, res) {
        cb(err, res)
      })

    },
    saveToDropbox: function(req, res){

      if (!req.session.isDropboxSynced) {
        res.type('text/plain')
        return res.status(403).send("You are not authenticated with Dropbox.")
      }

      var access_token = {oauth_token : req.session.dropbox.oauth.access_token, oauth_token_secret : req.session.dropbox.oauth.access_token_secret};

      var dboxclient = dboxapp.client(access_token)

      // TODO: EXPOSE THE CORE MODULE SO WE CAN GENERATE RANDOM NAMES

      var pathToMdFile = req.body.pathToMdFile || '/Dillinger/' + md.generateRandomMdFilename('md')
      if (!path.extname(pathToMdFile))
        pathToMdFile += ".md"
      var contents = req.body.fileContents || 'Test Data from Dillinger.'

      dboxclient.put(pathToMdFile, contents, function(status, reply){
        return res.json({data: reply})
      })

    }, // end saveToDropbox
    handleIncomingFlowRequest: function(req, res, cb){

      var filePath = req.query.path
        , access_token = {oauth_token : req.session.dropbox.oauth.access_token, oauth_token_secret : req.session.dropbox.oauth.access_token_secret}
        , dboxclient = dboxapp.client(access_token)

      if (!access_token) {
        return res.redirect('/redirect/dropbox')
      }

      dboxclient.get(filePath, function(status, reply, metadata){
        return res.json({data: reply.toString(), filename: path.basename(filePath)})
      })

    } // end handleIncomingFlowRequest

  }

})()

