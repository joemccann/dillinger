
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
  app.set('port', process.env.PORT || 3000)
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

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'))
})
