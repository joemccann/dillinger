var express = require('express')
  , app = module.exports = express()
  , OneDrive = require('./onedrive.js').OneDrive
  , fs = require('fs')
  , path = require('path');

/* OneDrive stuff */

function handle_onedrive_response(req, res, err, fn) {
  if (err) {
    if (err.code == 401 || err.code == 403) {
      req.session.onedrive = null;
      req.session.isOneDriveSynced = false;
    }
    res.status(err.code || 400).send('Error: ' + err.message);
  } else {
    fn(req, res);
  }
}

var oauth_onedrive_redirect = function(req, res) {
  res.redirect(OneDrive.generateAuthUrl());
}

var oauth_onedrive = function(req, res) {
  var code = req.query.code;
  OneDrive.getToken(code, function(err, tokens) {
    if (!err) {
      req.session.isOneDriveSynced = true;
      req.session.onedrive = tokens;
    }
    res.redirect('/');
  });
}

var unlink_onedrive = function(req, res) {
  req.session.onedrive = null;
  req.session.isOneDriveSynced = false;
  res.redirect('/');
}

var import_onedrive = function(req, res) {
  if (!req.session.onedrive) {
    res.status(401).send('OneDrive is not linked.');
    return;
  }
  var tokens = req.session.onedrive;
  OneDrive.search(tokens, function(err, data) {
    handle_onedrive_response(req, res, err, function() {
      res.json(data);
    });
  });
}

var fetch_onedrive_file = function(req, res) {
  if (!req.session.onedrive) {
    res.status(401).send('OneDrive is not linked.');
    return;
  }
  var fileId = req.query.fileId
    , tokens = req.session.onedrive;
  OneDrive.get(tokens, fileId, function(err, response) {
    handle_onedrive_response(req, res, err, function() {
      res.json(response);
    });
  });
}

var save_onedrive = function(req, res) {
  if (!req.session.onedrive) {
    res.status(401).send('OneDrive is not linked.');
    return;
  }
  var fileId = req.query.fileId
    , content = req.body.content
    , title = req.body.title
    , tokens = req.session.onedrive;
  OneDrive.save(tokens, fileId, title, content, function(err, data) {
    handle_onedrive_response(req, res, err, function() {
      res.send(data);
    });
  });
}

/* End of OneDrive stuff */

/* Begin OneDrive */
app.get('/redirect/onedrive', oauth_onedrive_redirect);

app.get('/oauth/onedrive', oauth_onedrive);

app.get('/unlink/onedrive', unlink_onedrive);

app.get('/import/onedrive', import_onedrive);

app.get('/fetch/onedrive', fetch_onedrive_file);

app.post('/save/onedrive', save_onedrive);

app.get('/js/onedrive.js', function(req, res) {
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
/* End OneDrive */
