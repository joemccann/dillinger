var express = require('express')
  , request = require('request')
  , fs = require('fs')
  , util = require('util')
  , exec = require('child_process').exec
  , stylus = require('stylus')
  , fs = require('fs')
  , smoosh = require('smoosh')
  , cluster = require('cluster')
  , path = require('path')
  , redis = require('redis')
  , passwordHash = require('password-hash')
  , md = require(__dirname + '/utils/md').md
  , github = require(__dirname + '/utils/github').github
  , debug
  , redisStore
  , redisClient
  , github_api = 'https://api.github.com/'


var numCPUs = require('os').cpus().length

var appConfig = JSON.parse(fs.readFileSync(__dirname + '/app.json', 'UTF-8'))

var githubConfig = JSON.parse(fs.readFileSync(__dirname + '/config/github.json', 'UTF-8'))

var app = module.exports = express.createServer()


// If debugging...
if(appConfig.DEBUG){

  // set the debug flag
  debug = appConfig.DEBUG  
  
}

// If hacking on localhost/local machine
if(appConfig.LOCALHOST){

   appConfig.PORT = debug ? 5050 : appConfig.PORT
 
}

// Initialize Redis connection
initRedis()

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.set('env', debug ? 'development' : 'production');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: "dillinger", store: new RedisStore, cookie: { maxAge: 60000*( (60*24) * 30)} })); // 30 days
  app.use(stylus.middleware({
      src: __dirname + "/public"
    , compile: !debug
  }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res, next){
  
  if(typeof req.session.oauth !== 'undefined' && typeof req.session.oauth.github !== 'undefined'){
    
    // VALIDATE THE TOKEN BY FETCHING USERNAME
    var github_url = github_api + 'user?access_token=' + req.session.oauth.github

    request.get(github_url, function(err, resp, data){
      if(err) {
        res.redirect(resp.statusCode)
      }
      else if(!err && resp.statusCode == 200) 
      {
        var d = JSON.parse(data)
        var username = req.session.oauth.username = d.login 
        
        res.render('dillinger', 
        {
          title: 'Dillinger, the last Markdown editor, ever.'
        , version: appConfig.VERSION
        , debugging: debug
        , layout: 'dillinger-layout'
        , loggedIn: true
        , github: 
          {
            username: username
          }
        })
        
      } // end else if
      else{
        
        res.render('dillinger', 
        {
          title: 'Dillinger, the last Markdown editor, ever.'
        , version: appConfig.VERSION
        , debugging: debug
        , layout: 'dillinger-layout'
        , loggedIn: false
        , github: 
          {
            client_id: githubConfig.client_id
          , callback_url: githubConfig.callback_url
          }
        })
        
      }
    }) // end request callback
    
  } // end if github oauth undefined
  else{

    res.render('dillinger', 
    {
      title: 'Dillinger, the last Markdown editor, ever. '
    , version: appConfig.VERSION
    , debugging: debug
    , layout: 'dillinger-layout'
    , loggedIn: false
    , github: 
      {
        client_id: githubConfig.client_id
      , callback_url: githubConfig.callback_url
      }
    })
  } // end else
  
})

app.get('/oauth/github', function(req, res, next){

  if(!req.query.code) next()
  else{
    req.session.oauth = {}
    
      var code = req.query.code
        , client_id = githubConfig.client_id
        , redirect_uri = githubConfig.redirect_uri
        , client_secret = githubConfig.client_secret
      
      // TODO: CHANGE TO QUERYSTRING MODULE?
      var params = '?code='+code
                    +'&client_id='+client_id
                    +'&redirect_url='+redirect_uri
                    +'&client_secret='+client_secret
    
      var opts = {
        uri: 'https://github.com/login/oauth/access_token'+params
      }

      request.post(opts, function(err, resp, body){
        // TODO: MAKE THIS MORE GRACEFUL
        if(err) res.send(err.message)
        else {
          // TODO: CERTAINLY A MORE EFFICIENT WAY...BETTER REGEX
          var s = body.split('=')
          var token = s[1].replace('&token_type', '')
          req.session.oauth.github = token
          req.session.oauth.username = ''
          res.redirect('/')
        }
      })
    
    } // end else
    
})

app.get('/oauth/test/github', function(req, res){

  res.render('test_oauth_github', {
    title: 'Dillinger, the last Markdown editor, ever. By Joe McCann',
    version: appConfig.VERSION,
    debugging: debug,
    layout: 'dillinger-layout'
  })

})

app.post('/github/repo/fetch_all', function(req,res){
  
  var github_url = github_api + 'user/repos?access_token=' + req.session.oauth.github
  
  request.get(github_url, function(err, resp, data){
    if(err) {
      res.send(
        {
          error: 'Request error.' 
        , data: resp.statusCode
        })
    }
    else if(!err && resp.statusCode == 200) 
    {
      var set = []

      data = JSON.parse(data)

      data.forEach(function(el){

        var item = 
        {
          url: el.url
        , private: el.private
        }
        
        set.push(item)
      })

      res.json(set)

    } // end else if
    else{
      res.json({error: 'Unable to fetch repos from Github.'})
    }
  }) // end request callback
  
})

app.post('/github/repo/fetch_branches', function(req,res){
  
  var github_url = github_api 
                    + 'repos/' 
                    + req.session.oauth.username 
                    + '/'
                    + req.body.repo
                    +'/branches?access_token=' + req.session.oauth.github

  request.get(github_url, function(err, resp, data){
    if(err) {
      res.send(
        {
          error: 'Request error.' 
        , data: resp.statusCode
        })
    }
    else if(!err && resp.statusCode == 200) 
    {
      res.send(data)
    } // end else if
    else{
      res.json({error: 'Unable to fetch repos from Github.'})
    }
  }) // end request callback
  
})

app.post('/github/repo/fetch_tree_files', function(req,res){
  // /repos/:user/:repo/git/trees/:sha
    
  var github_url = github_api 
                    + 'repos/' 
                    + req.session.oauth.username 
                    + '/'
                    + req.body.repo
                    + '/git/trees/'
                    + req.body.sha + '?recursive=1&access_token=' + req.session.oauth.github

  request.get(github_url, function(err, resp, data){
    if(err) {
      res.send(
        {
          error: 'Request error.' 
        , data: resp.statusCode
        })
    }
    else if(!err && resp.statusCode == 200) 
    {

      data = JSON.parse(data)

      res.json(data)

    } // end else if
    else{
      res.json({error: 'Unable to fetch repos from Github.'})
    }
  }) // end request callback
  
})

app.post('/github/repo/fetch_markdown_file', function(req,res){
  
  var url = req.body.mdFile
    , isPrivateRepo = /blob/.test(url)
  
  // https://api.github.com/octocat/Hello-World/git/blobs/44b4fc6d56897b048c772eb4087f854f46256132
  // If it is a private repo, we need to make an API call, because otherwise it is the raw file.
  if(isPrivateRepo){
    url += '?access_token=' + req.session.oauth.github
  }
  
  request.get(url, function(err, resp, data){
    if(err){
      res.send(
        {
          error: 'Request error.' 
        , data: resp.statusCode
        })
    }
    else if(!err && resp.statusCode == 200) 
    {

      var json_resp = 
      {
        data: data
      , error: false
      }

      if(isPrivateRepo){
        var d = JSON.parse(data)
        json_resp.data = (new Buffer(d.content, 'base64').toString('ascii'))
      }

      res.json(json_resp)

    } // end else if
    else{
      res.json({error: 'Unable to fetch file from Github.'})
    }
  }) // end request callback

  
})


// save a markdown file and send header to download it directly as response 
app.post('/factory/fetch_markdown', function(req,res){
  
  var unmd = req.body.unmd
    , json_response = 
    {
      data: ''
    , error: false
    }
      
  // TODO: maybe change this to user submitted filename or name of repo imported file?
  var name = md.generateRandomMdFilename('md') 
  var filename = ( __dirname + '/public/files/md/' + name )
  
  // TODO: THIS CAN BE OPTIMIZED WITH PIPING INSTEAD OF WRITING TO DISK
  fs.writeFile( filename, unmd, 'utf8', function(err, data){

    if(err){
      json_response.error = true
      json_response.data = "Something wrong with the markdown conversion."
      res.send( JSON.stringify( json_response) );
      if(debug) throw err     
    }
    else{
      json_response.data = name
      res.send( JSON.stringify( json_response) );
     }
  }) // end writeFile
  
}) // end post

// save a html file and send header to download it directly as response 
app.post('/factory/fetch_html', function(req,res){
  
  var unmd = req.body.unmd
    , json_response = 
    {
      data: ''
    , error: false
    }
    
  var html = md.getHtml(req.body.unmd)  
  
  var name = md.generateRandomMdFilename('html') 
  
  var filename = ( __dirname + '/public/files/html/' + name )
  
  fs.writeFile( filename, html, 'utf8', function(err, data){

    if(err){
      json_response.error = true
      json_response.data = "Something wrong with the markdown conversion."
      res.send( JSON.stringify( json_response) );
      if(debug) throw err     
    }
    else{
      json_response.data = name
      res.send( JSON.stringify( json_response) );
     }
  }) // end writeFile
  
}) // end post


// route to handle download of md file
app.get('/files/md/:mdid', function(req, res){
  
  var fileId = req.params.mdid
  
  var filename = __dirname + '/public/files/md/' + fileId
  
  res.attachment(filename)
  
  res.download(filename, function(err){
    if(err) throw err
    else{
      // Delete the file after download
      fs.unlink(filename, function(err, data){
        if(err) throw err
      })
    }
  })

})

// route to handle download of html file
app.get('/files/html/:html', function(req, res){
  
  var fileId = req.params.html
  
  var filename = __dirname + '/public/files/html/' + fileId
  
  res.attachment(filename)
  res.download(filename, function(err){
    if(err) throw err
    else{
      // Delete the file after download
      fs.unlink(filename, function(err, data){
        if(err) throw err
      })
    }
  })

})


// TODO: ADD THESE LATER? Nah, fuck it, Github is good enough.
app.get('/oauth/facebook', function(req,res){
  res.send('Not implemented yet.')
})

app.get('/oauth/twitter', function(req,res){
  res.send('Not implemented yet.')  
})



// Method that reads in the main stylus file and rewrites it with either 
// the cdn or local (debug) prefix for background images. 
// @param {String}  the path to the production (single) stylus file
function setStylusImagePrefix(productionFile){

  // Read in the stylus file that has the img prefix.
  fs.readFile(__dirname + appConfig.STYLUS_FILE, 'UTF-8', function(err,data){

    // Now we update the path of the image prefix, local or CDN...
    if(err) throw err
    else{
      // must be: imagePrefix="../img" or imagePrefix="http://cdn.foo.com/" in the stylus file.
      var d = data.replace(/imagePrefix=[A-Za-z0-9-:"'\.\/\\]+/i, debug 
                            ? 'imagePrefix="' + appConfig.IMAGE_PREFIX_DEBUG + '"'  
                            : 'imagePrefix="' + appConfig.IMAGE_PREFIX_PRODUCTION + '"')

       // write the file with the proper prefix.
       fs.writeFile(__dirname + appConfig.STYLUS_FILE, d, function(err,data){
        if(err) throw err
        else{
          
          console.log(appConfig.STYLUS_FILE.yellow + " file image prefix written successfully for %s environment.\n", app.settings.env)
          // console.log(d)

          // We need to compile the main stylus file for production
          var str = fs.readFileSync(productionFile, 'utf8');

          stylus(str)
            .set('filename', productionFile)
            .render(function(err, css){
              
              if (err) throw err

              // Write the style.css file...
              fs.writeFile( productionFile.replace('.styl', '.css'), css, function(err, data){
                
                if(err) throw err
                
                else{
                  console.log(productionFile.replace('.styl', '.css').yellow + " file written successfully for %s environment.\n", app.settings.env)

                  if(!debug){
                    // run smoosh for production
                    smoosh.config('./app.json')
                    smoosh.build('compressed')
                  }

                } // end else

              }) // end write style.css file

          }) // end stylus.render()

        } // end writeFile else 
      
       }) // end writeFile()

    } // end readFile else

  }) // end readFile()

}

function initRedis(){
  
  redisClient = redis.createClient()

  redisClient.on("error", function (err) {
      console.log("Redis connection error to " + redisClient.host + ":" + redisClient.port + " - " + err);
  });

  redisClient.on("connect", function (err){});

  RedisStore = require('connect-redis')(express);
  
}

function init(){ 
  
    // This should be the filename that is the single stylus file for production.
  var productionStylusFile = __dirname + appConfig.CSS_PRODUCTION
  
  setStylusImagePrefix( productionStylusFile )
  
}


if (cluster.isMaster){

  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork()
  }
  
  cluster.on('death', function(worker) {
    // We need to spin back up on death.
    cluster.fork()
    console.log('worker ' + worker.pid + ' died');
  })

}
else{ app.listen(appConfig.PORT) }

init()