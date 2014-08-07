/*jslint stupid: true */
/**
 * Module dependencies.
 */

var config = require('./config')()
  , express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , app = express()
  , github = require('./plugins/github/server.js')

app.configure(function(){
  app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.compress());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.cookieSession());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));

  // Setup local variables to be available in the views.
  app.locals.title = config.title || "Dillinger.";
  app.locals.description = config.description || "Dillinger, the last Markdown Editor, ever.";
  if (config.googleWebmasterMeta) {
    app.locals.googleWebmasterMeta = config.googleWebmasterMeta;
  }
  app.locals.node_version = process.version.replace('v', '');
  app.locals.app_version = require('./package.json').version;
  app.locals.env = process.env.NODE_ENV;
  app.locals.readme = fs.readFileSync(path.resolve(__dirname, './README.md'), 'utf-8');
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

app.get('/not-implemented', routes.not_implemented);

/* Begin Dropbox */

app.get('/redirect/dropbox', routes.oauth_dropbox_redirect);

app.get('/oauth/dropbox', routes.oauth_dropbox);

app.get('/unlink/dropbox', routes.unlink_dropbox);

app.post('/import/dropbox', routes.import_dropbox);

// app.get('/account/dropbox', routes.account_info_dropbox)

app.post('/fetch/dropbox', routes.fetch_dropbox_file);

app.post('/save/dropbox', routes.save_dropbox);


/* End Dropbox */

/* Begin Google Drive */

app.get('/redirect/googledrive', routes.oauth_googledrive_redirect);

app.get('/oauth/googledrive', routes.oauth_googledrive);

app.get('/unlink/googledrive', routes.unlink_googledrive);

app.get('/import/googledrive', routes.import_googledrive);

app.get('/fetch/googledrive', routes.fetch_googledrive_file);

app.post('/save/googledrive', routes.save_googledrive);

/* End Google Drive */

app.use(github);

/* Dillinger Actions */

// save a markdown file and send header to download it directly as response
app.post('/factory/fetch_markdown', routes.fetch_md);

// Route to handle download of md file
app.get('/files/md/:mdid', routes.download_md);

// Save an html file and send header to download it directly as response
app.post('/factory/fetch_html', routes.fetch_html);

app.post('/factory/fetch_html_direct', routes.fetch_html_direct);

// Route to handle download of html file
app.get('/files/html/:html', routes.download_html);

// Save a pdf file and send header to download it directly as response
app.post('/factory/fetch_pdf', routes.fetch_pdf);

// Route to handle download of pdf file
app.get('/files/pdf/:pdf', routes.download_pdf);

/* End Dillinger Actions */


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
  console.log("\nhttp://localhost:" + app.get('port') + "\n");
});
