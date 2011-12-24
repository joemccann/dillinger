var querystring = require('querystring')
  , fs = require('fs')
  , OAuth = require('oauth').OAuth
  , request = require('request')

var config = JSON.parse(fs.readFileSync('./config/dropbox.json'))

function Dropbox(){
  
  var _oauth
    , _request_token
    , _request_token_secret
    , _access_token_secret
    , _access_token
    , API_URI = 'https://api.dropbox.com/1'
    , CONTENT_API_URI = 'https://api-content.dropbox.com/1'
    , REQUEST_TOKEN_URI = 'https://api.dropbox.com/1/oauth/request_token'
    , ACCESS_TOKEN_URI = 'https://api.dropbox.com/1/oauth/access_token'
    , METADATA_URI = 'https://api.dropbox.com/1/metadata'
    , ACCOUNT_INFO_URI = 'https://api.dropbox.com/1/account/info'
    , SEARCH_URI = 'https://api.dropbox.com/1/search'


  // Fetch access token and secret from dropbox.
  function _getRequestToken(){

    _oauth.get( REQUEST_TOKEN_URI, null, null, function(err, data, res){
      if (err) {
        console.error(err)
        throw err
      }
      else {
        var d = querystring.parse(data)
        // console.dir(d)
        _request_token = d.oauth_token
        _request_token_secret = d.oauth_token_secret

      }

    })  // end _oauth.get()

  } // end _getRequestToken()

  // Constructor...
  !function(){

    // Create OAuth client.
    _oauth = new OAuth(API_URI + '/oauth/request_token'
                              , API_URI + '/oauth/access_token'
                              , config.consumer_key, config.consumer_secret
                              , '1.0', null, 'HMAC-SHA1')

    _getRequestToken()

  }()
  
  // Public API Object
  return {
    
    getRequestToken: function(){
      return _request_token
    },
    getRequestSecret: function(){
      return _request_token_secret
    },
    setAccessToken: function(token){
      console.log('Setting access token: ' + token.green + '\n')
      _access_token = token
    },
    setAccessTokenSecret: function( access_token_secret ){
      console.log('Setting access token secret: ' + access_token_secret.green + '\n')
      _access_token_secret = access_token_secret
    },
    getRemoteAccessToken: function(cb){
      _oauth.get( 
                  ACCESS_TOKEN_URI, 
                  _access_token, 
                  _request_token_secret, 
                  function(err, data, res){
                    if (err) return cb(err)
                    else {
                      var d = querystring.parse(data)
                      _access_token_secret = d.oauth_token_secret
                      _access_token = d.oauth_token
                      cb(null, d)
                  }
      }) // end _oauth.get()
    }, // end getAccessToken()
    getOauthCallback: function(){
      return config.oauth_callback
    },
    getMetadata: function(cb){

      _oauth.get( METADATA_URI + "/dropbox/"
                  , _access_token
                  , _access_token_secret
                  , function(err, data, res) {
                      if(err) return cb(err)
                      else{
                        cb(null, data)
                      }
                  })
      
    }, // end getMetadata()
    getAccountInfo: function(cb){
      
      _oauth.get( ACCOUNT_INFO_URI
                  , _access_token
                  , _access_token_secret
                  , function(err, data, res){
                    if(err) return cb(err)
                    else{
                      cb(null, data)
                    }
                  })
    }, // end getAccountInfo()
    searchForMdFiles: function(cb){

      _oauth.get( SEARCH_URI + "/dropbox/?query=.md&file_limit=500"
                  , _access_token
                  , _access_token_secret
                  , function(err, data, res) {
                      if(err) return cb(err)
                      else{
                        cb(null, data)
                      }
                  })
      
    } // searchForMdFiles
  } // end public API object
  
} // end Dropbox()

exports.dropbox = new Dropbox()