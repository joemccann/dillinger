
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
  app.set('port', process.env.PORT || 8080)
  app.set('views', __dirname + '/views')
  app.set('view engine', 'ejs')
  app.use(express.favicon())
  app.use(express.logger('dev'))
  app.use(express.compress())
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(express.cookieParser('your secret here'))
  app.use(express.cookieSession())
  app.use(app.router)
  app.use(require('stylus').middleware(__dirname + '/public'))
  app.use(express.static(path.join(__dirname, 'public')))

  var package = require(path.resolve(__dirname, './package.json'))
  
  // Setup local variables to be available in the views.
  app.locals.title = "Leaf Online Markdown Editor"
  app.locals.description = "Leaf Online cloud based HTML5 filled Markdown Editor"
  app.locals.node_version = process.version.replace('v', '')
  app.locals.app_version = package.version
  app.locals.env = process.env.NODE_ENV
  app.locals.readme = fs.readFileSync( path.resolve(__dirname, './README.md'), 'utf-8')
  
  // Compress/concat files for deploy env...
  // Need to run this locally BEFORE deploying
  // to nodejitsu
  if(app.locals.env === 'predeploy'){
    // Smoosh the things
    var smoosh = require('smoosh')
    
    smoosh.make({
      "VERSION": app.locals.app_version,
      "JSHINT_OPTS": {
        "browser": true,
        "evil":true, 
        "boss":true, 
        "asi": true, 
        "laxcomma": true, 
        "expr": true, 
        "lastsemic": true, 
        "laxbreak":true,
        "regexdash": true,
      },
      "JAVASCRIPT": {
        "DIST_DIR": "./public/js",
        "dependencies": [ { "src": "./public/js/bootstrap.js", "jshint": false}, 
                          { "src": "./public/js/ace.js", "jshint": false}, 
                          { "src": "./public/js/mode-markdown.js", "jshint": false}, 
                          { "src": "./public/js/showdown.js", "jshint": false},
                          { "src": "./public/js/keymaster.js", "jshint": false}],
        "dillinger": [ "./public/js/dillinger.js" ]
      },
      "CSS": {
        "DIST_DIR": "./public/css",
        "style": [ "./public/css/style.css" ]
      }
    })
    
  } // end if production env
  
})

app.configure('development', function(){
  app.use(express.errorHandler())
})

app.get('/', routes.index)

app.get('/not-implemented', routes.not_implemented)

/* Begin Dropbox */

app.get('/oauth/dropbox', routes.oauth_dropbox)

app.get('/unlink/dropbox', routes.unlink_dropbox)

app.get('/import/dropbox', routes.import_dropbox)

// app.get('/account/dropbox', routes.account_info_dropbox)

app.post('/fetch/dropbox', routes.fetch_dropbox_file)

app.post('/save/dropbox', routes.save_dropbox)

/* End Dropbox */

/* Begin Github */

app.get('/oauth/github', routes.oauth_github)

app.get('/unlink/github', routes.unlink_github)

// app.get('/account/github', routes.account_info_github)

app.post('/import/github/repos', routes.import_github_repos)

app.post('/import/github/branches', routes.import_github_branches)

app.post('/import/github/tree_files', routes.import_tree_files)

app.post('/import/github/file', routes.import_github_file)

app.post('/save/github', routes.save_github)

/* End Github */



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
