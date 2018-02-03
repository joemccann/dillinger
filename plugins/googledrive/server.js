var express = require('express')
  , app = module.exports = express()
  , GoogleDrive = require('./googledrive.js').GoogleDrive
  , fs = require('fs')
  , path = require('path')

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

var oauth_googledrive_redirect = function(req, res) {
  res.redirect(GoogleDrive.generateAuthUrl());
}

var oauth_googledrive = function(req, res) {
  var code = req.query.code;
  GoogleDrive.getToken(code, function(err, tokens) {
    if (!err) {
      req.session.isGoogleDriveSynced = true;
      req.session.googledrive = tokens;
    }
    res.redirect('/');
  });
}

var unlink_googledrive = function(req, res) {
  req.session.googledrive = null;
  req.session.isGoogleDriveSynced = false;
  res.redirect('/');
}

var import_googledrive = function(req, res) {
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

var fetch_googledrive_file = function(req, res) {
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

var save_googledrive = function(req, res) {
  if (!req.session.googledrive) {
    res.status(401).send('Google Drive is not linked.');
    return;
  }
  var fileId = req.body.fileId
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

/* Begin Google Drive */
app.get('/redirect/googledrive', oauth_googledrive_redirect);

app.get('/oauth/googledrive', oauth_googledrive);

app.get('/unlink/googledrive', unlink_googledrive);

app.get('/import/googledrive', import_googledrive);

app.get('/fetch/googledrive', fetch_googledrive_file);

app.post('/save/googledrive', save_googledrive);

app.get('/js/googledrive.js', function(req, res) {
  fs.readFile(path.join(__dirname, 'client.js'), 'utf8', function(err, data) {
    if (err) {
      res.send(500, "Sorry couldn't read file")
    }
    else {
      res.setHeader('content-type', 'text/javascript');
      res.send(200, data)
    }
  })
})
/* End Google Drive */
