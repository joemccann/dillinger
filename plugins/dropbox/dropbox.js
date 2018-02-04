var fs = require('fs')
  , path = require('path')
  , request = require('request')
  , qs = require('querystring')
  , url = require('url')
  , parallel = require('./parallel')
  , DropboxSDK = require('dropbox').Dropbox;
  ;

var dropbox_config_file = path.resolve(__dirname, '../../configs/dropbox/', 'dropbox-config.json')
  , dropbox_config = {}
  , isConfigEnabled = false
  ;
// ^^^helps with the home page view; should we show the dropbox dropdown?

if (fs.existsSync(dropbox_config_file)) {
  dropbox_config = require(dropbox_config_file);
  isConfigEnabled = true;
  console.log('Dropbox config found in environment. Plugin enabled. (Key: "' + dropbox_config.app_key + '")');  
} else if (process.env.dropbox_app_key !== undefined) {
  dropbox_config = {
    "app_key": process.env.dropbox_app_key,
    "app_secret": process.env.dropbox_app_secret,
    "callback_url": process.env.dropbox_callback_url,
    "auth_url": "https://www.dropbox.com/oauth2/authorize"
  };
  isConfigEnabled = true;
  console.log('Dropbox config found in environment. Plugin enabled. (Key: "' + dropbox_config.app_key + '")');
} else {
  dropbox_config = {
    "app_key": "YOUR_KEY"
  , "app_secret": "YOUR_SECRET"
  , "callback_url": "YOUR_CALLBACK_URL"
  , "auth_url": "https://www.dropbox.com/oauth2/authorize"
  };
  console.warn('Dropbox config not found at ' + dropbox_config_file + '. Plugin disabled.');
}

exports.Dropbox = (function() {

  var dbx = new DropboxSDK({ accessToken: dropbox_config.app_key, clientId: dropbox_config.app_key });
  dbx.setClientSecret(dropbox_config.app_secret);
  
  function arrayToRegExp(arr) {
    return new RegExp("(" + arr.map(function(e) { return e.replace('.','\\.'); }).join('|') + ")$", 'i');
  }

  return {
    isConfigured: isConfigEnabled,
    config: dropbox_config,
    // Get a URL that can be used to authenticate users for the Dropbox API.
    getAuthUrl: function(req, res, cb) {
      return cb(dbx.getAuthenticationUrl(dropbox_config.callback_url, null, 'code'));
    },
    // Get an OAuth2 access token from an OAuth2 Code.
    getRemoteAccessToken: function(code, cb) {
      dbx.getAccessTokenFromCode(dropbox_config.callback_url, code).then(function(result) {
        return cb('ok', result)
      })

    }, // end getRemoteAccessToken()
    getAccountInfo: function(dropboxObj, cb) {
      dbx.setAccessToken(dropboxObj);
      dbx.usersGetCurrentAccount().then(function(user) {
        cb(null, user)
      }).catch(function(err) {
        cb(err)
      });

    }, // end getAccountInfo()
    fetchDropboxFile: function(req, res) {

      if (!req.session.isDropboxSynced) {
        res.type('text/plain')
        return res.status(403).send("You are not authenticated with Dropbox.")
      }

      var pathToMdFile = req.body.mdFile
      dbx.filesDownload({path: pathToMdFile}).then(function(doc) {
        // https://github.com/joemccann/dillinger/issues/64
        // In case of an empty file...
        var reply = doc.fileBinary ? doc.fileBinary.toString() : ''
        return res.json({data: reply})
        })

    },
    searchForMdFiles: function(opts, cb) {

        var fileExts = opts.fileExts.split('|')
        , regExp = arrayToRegExp(fileExts)
        , batches
        ;

      // generate a new dropbox search per file extension
      batches = fileExts.map(function(ext) {
        return function(_cb) {
          dbx.filesSearch({path: '', query: ext, max_results: 500, mode: 'filename'}).then(function(res) {
            var files = []
            res.matches.forEach(function(item) {
              if (regExp.test(item.metadata.path_lower)) {
                files.push(item.metadata)
              }
            });
            _cb(null, files)
          }).catch(function(err) {
            _cb(err, null)
          });
        }
      })

      parallel(batches, function(err, res) {
        cb(err, res)
      })

    },
    saveFileToDropbox: function(req, res){

      if (!req.session.isDropboxSynced) {
        res.type('text/plain')
        return res.status(403).send("You are not authenticated with Dropbox.")
      }

      // TODO: EXPOSE THE CORE MODULE SO WE CAN GENERATE RANDOM NAMES
      var pathToMdFile = req.body.pathToMdFile || '/Dillinger/' + md.generateRandomMdFilename('md')
      if (!path.extname(pathToMdFile))
        pathToMdFile += ".md"
      var contents = req.body.fileContents || 'Test Data from Dillinger.'

      dbx.filesUpload({path: pathToMdFile, contents: contents, autorename: true, mode : {'.tag': 'overwrite'}}).then(function(reply) {
        return res.json({data: reply})
      })

    }, // end saveFileToDropbox
    saveImageToDropbox: function(req, res){

      if (!req.session.isDropboxSynced) {
        res.type('text/plain')
        return res.status(403).send("You are not authenticated with Dropbox.")
      }

        var pathToImage = '/Dillinger/_images/' + req.body.image_name
        , base64_data = req.body.fileContents.split(',')[1] // Is this thorough enough?
        , buffer = new Buffer(base64_data, 'base64')
        ;

      // For local testing...
      // var filepath = path.resolve(__dirname, '../../public/files/') + "/" + req.body.image_name
      
      // console.log(filepath + " is the local path")
      
      // fs.writeFile( filepath, buffer, function (err) {
      //   if(err) console.error(err)
      //     console.log('wrote the file')
      // }); 
      // End local testing...
      dbx.filesUpload({path: pathToImage, contents: buffer, mode : {'.tag': 'add'}})
        .then(function() {
          return dbx.sharingCreateSharedLink({path: pathToImage})
        .then(function(reply) {
          reply.url = reply.url + '&raw=1'
          return res.json({data: reply})
        })
      })

    }

  }

})()

