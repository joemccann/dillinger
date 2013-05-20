var fs = require('fs')
  , path = require('path')
  , request = require('request')
  , dbox = require('dbox')
  , qs = require('querystring')
  , _ = require('lodash')

var dropbox_config_file = path.resolve(__dirname, 'dropbox-config.json')
  , dropbox_config = {}
  , isUsingDefaultConfig = true
// ^^^helps with the home page view; should we show the dropbox dropdown?

if(fs.existsSync(dropbox_config_file)) {
  dropbox_config = JSON.parse( fs.readFileSync( dropbox_config_file, 'utf-8' ) )
  isUsingDefaultConfig = false
} else {
  dropbox_config = {
    "app_key": "YOUR_KEY"
  , "app_secret": "YOUR_SECRET"
  , "callback_url": "YOUR_CALLBACK_URL"
  , "auth_url": "https://www.dropbox.com/1/oauth/authorize"
  , "request_token_url": "https://api.dropbox.com/1/oauth/request_token"
  , "access_token_url": "https://api.dropbox.com/1/oauth/access_token"
  }
  console.warn('Dropbox config not found at ' + dropbox_config_file + '. Using defaults instead.')
}

exports.Dropbox = (function() {

  var dboxapp = dbox.app({ "app_key": dropbox_config.app_key, "app_secret": dropbox_config.app_secret, "root": "dropbox" })
  
  return {
    isUsingDefault: isUsingDefaultConfig,
    config: dropbox_config,
    getNewRequestToken: function(req, res, cb) {

      dboxapp.requesttoken(function(status, request_token){

        console.log(request_token)
        return cb(status, request_token)

      })
      // Create your auth_url for the view   


    },
    getRemoteAccessToken: function(request_token, request_token_secret, cb) {

      var req_token = {oauth_token : request_token, oauth_token_secret : request_token_secret};
      dboxapp.accesstoken(req_token, function(status, access_token) {

          console.log(access_token)
          return cb(status, access_token)
      
      });
      
    }, // end getRemoteAccessToken()
    getAccountInfo: function(dropbox_obj, cb) {
      var access_token = {oauth_token : dropbox_obj.oauth.access_token, oauth_token_secret : dropbox_obj.oauth.access_token_secret};

      var dboxclient = dboxapp.client(access_token)

      dboxclient.account(function(status, reply){
        return cb(status, reply)
      })
      
    }, // end getAccountInfo()
    fetchDropboxFile: function(req, res) {
      
      if(!req.session.isDropboxSynced){
        res.type('text/plain')
        return res.status(403).send("You are not authenticated with Dropbox.")
      } 

      var access_token = {oauth_token : req.session.dropbox.oauth.access_token, oauth_token_secret : req.session.dropbox.oauth.access_token_secret};

      var dboxclient = dboxapp.client(access_token)
                  
      var pathToMdFile = req.body.mdFile

      dboxclient.get(pathToMdFile, function(status, reply, metadata) {

        return res.json({data: reply.toString()})

      })

    },
    searchForMdFiles: function(dropbox_obj, cb) {
      
      // *sigh* http://forums.dropbox.com/topic.php?id=50266&replies=1
      
      var access_token = {oauth_token : dropbox_obj.oauth.access_token, oauth_token_secret : dropbox_obj.oauth.access_token_secret};

      var dboxclient = dboxapp.client(access_token)

      var options = {
        file_limit         : 500,
        include_deleted    : false
      }

      dboxclient.search("/", ".md", options, function(status, reply){
        if(status > 399){
          return cb(status)
        }
        var regex = /.*\.md$/i;
        var files = []
        reply.forEach(function(item){
          if(regex.test(item.path)) {
            files.push(item)
          }
        })
        dboxclient.search("/", ".mdown", options, function(status, reply) {
          files = files.concat(reply)
          dboxclient.search("/", ".markdown", options, function(status, reply) {
            files = files.concat(reply)
            return cb(status, files)
          })
        })
      })
        
    },
    saveToDropbox: function(req, res){

      if(!req.session.isDropboxSynced){
        res.type('text/plain')
        return res.status(403).send("You are not authenticated with Dropbox.")
      } 

      var access_token = {oauth_token : req.session.dropbox.oauth.access_token, oauth_token_secret : req.session.dropbox.oauth.access_token_secret};

      var dboxclient = dboxapp.client(access_token)

      // TODO: EXPOSE THE CORE MODULE SO WE CAN GENERATE RANDOM NAMES

      var pathToMdFile = req.body.pathToMdFile || '/Dillinger/' + md.generateRandomMdFilename('md')
      var contents = req.body.fileContents || 'Test Data from Dillinger.'

      dboxclient.put(pathToMdFile, contents, function(status, reply){
        return res.json({data: reply})
      })

    } // end saveToDropbox
  }
  
})()

