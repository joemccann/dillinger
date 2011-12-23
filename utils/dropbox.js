var DropboxClient = require('dropbox').DropboxClient
  , fs = require('fs')

var config = JSON.parse(fs.readFileSync('./config/dropbox.json'))

function Dropbox(){
  
  var _dropbox
    , _access_token = _access_secret = ''

  // Like a constructor
   
  _dropbox = new DropboxClient(config.consumer_key, config.consumer_secret)
  
  _dropbox.getAccessToken(config.email, config.password, function(err, token, secret) {
    if(err) {
      console.error(err)
      throw err
    }else{
      _access_token = token
      _access_secret = secret
    }
  }) // end getAccessToken
  
  return {
    
    getAccessToken: function(){
      return _access_token
    },
    getAccessSecret: function(){
      return _access_secret
    },
    getOauthCallback: function(){
      return config.oauth_callback
    }

  } // end API
  
} // end Dropbox()

exports.dropbox = new Dropbox()