
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')

var app = express()

app.configure(function(){
  app.set('port', process.env.PORT || 80)
  app.set('views', __dirname + '/views')
  app.set('view engine', 'ejs')
  app.use(express.favicon())
  app.use(express.logger('dev'))
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(express.cookieParser('your secret here'))
  app.use(express.cookieSession())
  app.use(app.router)
  app.use(require('stylus').middleware(__dirname + '/public'))
  app.use(express.static(path.join(__dirname, 'public')))
  
  // Setup local variables to be available in the views.
  app.locals.title = "Online Markdown Editor - Dillinger, the Last Markdown Editor ever."
  app.locals.description = "Online cloud based HTML5 filled Markdown Editor"
  app.locals.node_version = process.version.replace('v', '')
  app.locals.readme = fs.readFileSync( path.resolve(__dirname, './README.md'), 'utf-8')
})

app.configure('development', function(){
  app.use(express.errorHandler())
})

app.get('/', routes.index)

/* Begin Dropbox */

app.get('/oauth/dropbox', routes.oauth_dropbox)

app.get('/unlink/dropbox', routes.unlink_dropbox)

app.get('/import/dropbox', routes.import_dropbox)

app.get('/save/dropbox', routes.save_dropbox)

app.get('/account/dropbox', routes.account_info_dropbox)

app.post('/fetch/dropbox', routes.fetch_dropbox_file)

/* End Dropbox */


/* Dillinger Actions */
// save a markdown file and send header to download it directly as response 
app.post('/factory/fetch_markdown', routes.fetch_md)

// Route to handle download of md file
app.get('/files/md/:mdid', routes.download_md)

// Save an html file and send header to download it directly as response 
app.post('/factory/fetch_html', routes.fetch_html)

// Route to handle download of html file
app.get('/files/html/:html', routes.download_html)


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'))
})
