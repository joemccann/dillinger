/**
 * Main Application File for Dillinger.
 */

'use strict'

const config = require('./config')()
const methodOverride = require('method-override')
const logger = require('morgan')
const favicon = require('serve-favicon')
const compress = require('compression')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')
const express = require('express')
const netjet = require('netjet')
const routes = require('./routes')
const serveStatic = require('serve-static')
const errorHandler = require('errorhandler')
const path = require('path')
const fs = require('fs')
const app = express()
const core = require('./plugins/core/server.js')
const dropbox = require('./plugins/dropbox/server.js')
const bitbucket = require('./plugins/bitbucket/server.js')
const github = require('./plugins/github/server.js')
const medium = require('./plugins/medium/server.js')
const googledrive = require('./plugins/googledrive/server.js')
const onedrive = require('./plugins/onedrive/server.js')
const env = process.env.NODE_ENV || 'development'

require('isomorphic-fetch') /* patch global fetch for dropbox module */

app.set('port', process.env.PORT || 8080)
app.set('bind-address', process.env.BIND_ADDRESS || 'localhost')

app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')

// Required to trust GCP proxy for the x-forwarded-by heading
app.set('trust proxy', true)

// May not need to use favicon if using nginx for serving
// static assets. Just comment it out below.
app.use(favicon(path.join(__dirname, 'public/favicon.ico')))

if (env === 'development') {
  app.use(logger('dev'))
} else {
  app.use(logger('short'))
}
if (env === 'production') {
  app.use(require('connect-assets')({
    paths: ['public/js', 'public/css'],
    fingerprinting: true,
    build: false
  }))
}

app.use(compress())

app.use(bodyParser.json({
  limit: '512mb'
}))
app.use(bodyParser.urlencoded({
  limit: '512mb',
  extended: true
}))

app.use(methodOverride())
app.use(cookieParser('1337 h4x0r'))
app.use(cookieSession({
  name: 'dillinger-session',
  keys: ['open', 'source']
}))

// Let's 301 redirect to simply dillinger.io
app.use(function forceLiveDomain (req, res, next) {
  const host = req.get('Host')
  if (host === 'www.dillinger.io') {
    return res.redirect(301, 'http://dillinger.io' + req.originalUrl)
  }
  return next()
})

// Support for HTTP/2 Server Push
app.use(netjet({
  cache: {
    max: 100
  }
}))

// We do need this in any environment that is not Now/Zeit
app.use(serveStatic(path.join(__dirname, '/public')))

// Setup local variables to be available in the views.
app.locals.title = config.title || 'Dillinger.'
app.locals.description = config.description || 'Dillinger, the last Markdown Editor, ever.'
app.locals.dillinger_version = require('./package.json').version

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
app.locals.env = process.env.NODE_ENV

// At startup time so sync is ok.
app.locals.readme = fs.readFileSync(path.resolve(__dirname, './README.md'), 'utf-8')

if (env === 'development') {
  app.use(errorHandler())
}

app.get('/', routes.index)
app.get('/privacy', routes.privacy)
app.get('/not-implemented', routes.not_implemented)

app.use(core)
app.use(dropbox)
app.use(bitbucket)
app.use(github)
app.use(medium)
app.use(googledrive)
app.use(onedrive)

app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'))
  console.log('\nhttp://' + app.get('bind-address') + ':' + app.get('port') + '\n')
})
