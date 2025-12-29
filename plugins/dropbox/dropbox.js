const fs = require('fs');
const path = require('path');
const request = require('request');
const qs = require('querystring');
const url = require('url');
const { Dropbox, DropboxAuth } = require('dropbox');

let dropbox_config = {};
let isConfigEnabled = false;
// ^^^helps with the home page view; should we show the dropbox dropdown?

if (process.env.DROPBOX_APP_KEY) {
  dropbox_config = {
    "app_key": process.env.DROPBOX_APP_KEY,
    "app_secret": process.env.DROPBOX_APP_SECRET,
    "callback_url": process.env.DROPBOX_CALLBACK_URL,
    "auth_url": process.env.DROPBOX_AUTH_URL || "https://www.dropbox.com/oauth2/authorize"
  };
  isConfigEnabled = true;
  console.log('Dropbox config found in environment. Plugin enabled. (Key: "' + dropbox_config.app_key + '")');
} else if (process.env.dropbox_app_key) {
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
  console.warn('Dropbox config not found. Plugin disabled.');
}

exports.Dropbox = (function () {

  const dbxAuth = new DropboxAuth({
    clientId: dropbox_config.app_key,
    clientSecret: dropbox_config.app_secret
  });

  const dbx = new Dropbox({ auth: dbxAuth });

  function arrayToRegExp(arr) {
    return new RegExp("(" + arr.map(function (e) { return e.replace('.', '\\.'); }).join('|') + ")$", 'i');
  }

  return {
    isConfigured: isConfigEnabled,
    config: dropbox_config,
    // Get a URL that can be used to authenticate users for the Dropbox API.
    getAuthUrl: async function (req, res, cb) {
      try {
        const authUrl = await dbxAuth.getAuthenticationUrl(dropbox_config.callback_url, null, 'code');
        return cb(authUrl);
      } catch (err) {
        console.error('Error generating auth URL:', err);
        return cb(null, err);
      }
    },
    // Get an OAuth2 access token from an OAuth2 Code.
    getRemoteAccessToken: async function (code, cb) {
      try {
        const response = await dbxAuth.getAccessTokenFromCode(dropbox_config.callback_url, code);
        return cb('ok', response.result.access_token);
      } catch (err) {
        console.error('Error getting access token:', err);
        return cb('error', err);
      }
    }, // end getRemoteAccessToken()
    getAccountInfo: async function (token, cb) {
      try {
        dbxAuth.setAccessToken(token);
        const response = await dbx.usersGetCurrentAccount();
        cb(null, response.result);
      } catch (err) {
        console.error('Error getting account info:', err);
        cb(err);
      }
    }, // end getAccountInfo()
    fetchDropboxFile: async function (req, res) {
      if (!req.session.isDropboxSynced) {
        res.type('text/plain');
        return res.status(403).send("You are not authenticated with Dropbox.");
      }
      try {
        dbxAuth.setAccessToken(req.session.dropbox.oauthtoken);
        const pathToMdFile = req.body.mdFile;
        const response = await dbx.filesDownload({ path: pathToMdFile });
        // https://github.com/joemccann/dillinger/issues/64
        // In case of an empty file...
        const reply = response.result.fileBinary ? response.result.fileBinary.toString() : '';
        return res.json({ data: reply });
      } catch (err) {
        console.error('Error fetching Dropbox file:', err);
        if (err.status) {
          return res.status(err.status).json({ error: err.error || err.message });
        }
        return res.status(500).json({ error: 'Failed to fetch file' });
      }
    },
    searchForMdFiles: async function (token, opts, cb) {
      try {
        dbxAuth.setAccessToken(token);
        const fileExts = opts.fileExts.split('|');
        const regExp = arrayToRegExp(fileExts);

        const queries = fileExts.map(ext =>
          dbx.filesSearch({ path: '', query: ext, max_results: 500, mode: { '.tag': 'filename' } })
        );

        const responses = await Promise.all(queries);
        const files = [];

        responses.forEach(response => {
          response.result.matches.forEach(item => {
            if (regExp.test(item.metadata.path_lower)) {
              files.push(item.metadata);
            }
          });
        });

        cb(null, files);
      } catch (err) {
        console.error('Error searching for files:', err);
        cb(err, null);
      }
    },
    saveFileToDropbox: async function (req, res) {
      if (!req.session.isDropboxSynced) {
        res.type('text/plain');
        return res.status(403).send("You are not authenticated with Dropbox.");
      }

      try {
        dbxAuth.setAccessToken(req.session.dropbox.oauthtoken);
        // TODO: EXPOSE THE CORE MODULE SO WE CAN GENERATE RANDOM NAMES
        let pathToMdFile = req.body.pathToMdFile || '/Dillinger/' + md.generateRandomMdFilename('md');
        if (!path.extname(pathToMdFile)) {
          pathToMdFile += ".md";
        }
        const contents = req.body.fileContents || 'Test Data from Dillinger.';

        const response = await dbx.filesUpload({
          path: pathToMdFile,
          contents: contents,
          autorename: true,
          mode: { '.tag': 'overwrite' }
        });

        return res.json({ data: response.result });
      } catch (err) {
        console.error('Error saving file to Dropbox:', err);
        if (err.status) {
          return res.status(err.status).json({ error: err.error || err.message });
        }
        return res.status(500).json({ error: 'Failed to save file' });
      }
    }, // end saveFileToDropbox
    saveImageToDropbox: async function (req, res) {
      if (!req.session.isDropboxSynced) {
        res.type('text/plain');
        return res.status(403).send("You are not authenticated with Dropbox.");
      }

      try {
        dbxAuth.setAccessToken(req.session.dropbox.oauthtoken);
        const pathToImage = '/Dillinger/_images/' + req.body.image_name;
        const base64_data = req.body.fileContents.split(',')[1]; // Is this thorough enough?
        const buffer = Buffer.from(base64_data, 'base64');  // FIX: deprecated new Buffer()

        // For local testing...
        // const filepath = path.resolve(__dirname, '../../public/files/') + "/" + req.body.image_name
        // console.log(filepath + " is the local path")
        // fs.writeFile(filepath, buffer, function (err) {
        //   if(err) console.error(err)
        //     console.log('wrote the file')
        // });
        // End local testing...

        // Upload image
        await dbx.filesUpload({ path: pathToImage, contents: buffer, mode: { '.tag': 'add' } });

        // Create shared link
        const linkResponse = await dbx.sharingCreateSharedLink({ path: pathToImage });

        // Response is wrapped - access via .result
        const sharedLink = linkResponse.result;
        sharedLink.url = sharedLink.url + '&raw=1';

        return res.json({ data: sharedLink });
      } catch (err) {
        console.error('Error saving image to Dropbox:', err);

        // Handle "shared link already exists" error gracefully
        if (err.error && err.error.error_summary && err.error.error_summary.includes('shared_link_already_exists')) {
          try {
            const pathToImage = '/Dillinger/_images/' + req.body.image_name;
            const linksResponse = await dbx.sharingListSharedLinks({ path: pathToImage });
            const existingLink = linksResponse.result.links[0];
            existingLink.url = existingLink.url + '&raw=1';
            return res.json({ data: existingLink });
          } catch (linkErr) {
            console.error('Error getting existing shared link:', linkErr);
          }
        }

        if (err.status) {
          return res.status(err.status).json({ error: err.error || err.message });
        }
        return res.status(500).json({ error: 'Failed to save image' });
      }
    }

  }

})()

