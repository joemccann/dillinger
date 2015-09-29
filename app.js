/**
 * Main Application File for Dillinger.
 */

'use strict'

var config = require('./config')()
  , connect = require('connect')
  , methodOverride = require('method-override')
  , logger = require('morgan')
  , favicon = require('serve-favicon')
  , compress = require('compression')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , cookieSession = require('cookie-session')
  , express = require('express')
  , routes = require('./routes')
  , serveStatic = require('serve-static')
  , errorHandler = require('errorhandler')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , app = express()
  , dropbox = require('./plugins/dropbox/server.js')
  , github = require('./plugins/github/server.js')
  , googledrive = require('./plugins/googledrive/server.js')
  , onedrive = require('./plugins/onedrive/server.js')
  ;

app.set('port', process.env.PORT || 8080)
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')

// May not need to use favicon if using nginx for serving
// static assets. Just comment it out below.
app.use(favicon(path.join(__dirname, 'public/favicon.ico')))
app.use(logger('dev'))
app.use(compress())
app.use(bodyParser())
app.use(methodOverride())
app.use(cookieParser('your secret here'))
app.use(cookieSession({
  name: 'dillinger-session',
  keys: ['open', 'source']
}))

// May not need to use serveStatic if using nginx for serving
// static assets. Just comment it out below.
app.use(serveStatic(path.join(__dirname, 'public')))

// Setup local variables to be available in the views.
app.locals.title = config.title || 'Dillinger.'
app.locals.description = config.description || 'Dillinger, the last Markdown Editor, ever.'

if (config.googleWebmasterMeta) {
  app.locals.googleWebmasterMeta = config.googleWebmasterMeta
}

if (config.keywords) {
  app.locals.keywords = config.keywords
}

if (config.author) {
  app.locals.author = config.author
}

app.locals.node_version = process.version.replace('v', '')
app.locals.app_version = require('./package.json').version
app.locals.env = process.env.NODE_ENV

// At startup time so sync is ok.
app.locals.readme = fs.readFileSync(path.resolve(__dirname, './README.md'), 'utf-8')

if(app.get('env') === 'development'){
  app.use(errorHandler())
}

app.get('/', routes.index)

app.get('/not-implemented', routes.not_implemented)

app.use(dropbox)
app.use(github)
app.use(googledrive)
app.use(onedrive)

/* Dillinger Actions */

// save a markdown file and send header to download it directly as response
app.post('/factory/fetch_markdown', routes.fetch_md)

// Route to handle download of md file
app.get('/files/md/:mdid', routes.download_md)

// Save an html file and send header to download it directly as response
app.post('/factory/fetch_html', routes.fetch_html)

app.post('/factory/fetch_html_direct', routes.fetch_html_direct)

// Route to handle download of html file
app.get('/files/html/:html', routes.download_html)

// Save a pdf file and send header to download it directly as response
app.post('/factory/fetch_pdf', routes.fetch_pdf)

// Route to handle download of pdf file
app.get('/files/pdf/:pdf', routes.download_pdf)

/* End Dillinger Actions */


http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'))
  console.log('\nhttp://localhost:' + app.get('port') + '\n')
})
