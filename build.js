// Compress/concat files for deploy env...
// Need to run this locally BEFORE deploying
// to nodejitsu

var walkdir = require('walkdir')
  , path = require('path')
  , fs = require('fs')

/**
  Some helpers for deployment, cleaning up...
**/

// Pass in a path of a directory to walk and a 
// regex to match against.  The file(s) matching
// the patter will be deleted.
function walkAndUnlink(dirPath, regex){
  
  var emitter = walkdir(dirPath)

  emitter.on('file',function(filename,stat){
    if( regex.test(filename) ){
      console.log("Removing old file: " + filename)
      fs.unlinkSync( path.resolve( dirPath, filename) )
    }
  })
  
}

// Removes old css/js files.
function cleaner(){
    walkAndUnlink( path.join(__dirname, 'public', 'css'), new RegExp(/style-/) )
    walkAndUnlink( path.join(__dirname, 'public', 'js'), new RegExp(/dependencies-/) )
    walkAndUnlink( path.join(__dirname, 'public', 'js'), new RegExp(/dillinger-/) )
}

// Concats, minifies js and css for production
function smoosher(){

  // Compress/concat files for deploy env...
  // Need to run this locally BEFORE deploying
  // to nodejitsu
  require('smoosh').make({
    "VERSION": require('./package.json').version,
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
                        { "src": "./public/js/marked.js", "jshint": false},
                        { "src": "./public/js/keymaster.js", "jshint": false}],
      "dillinger": [ "./public/js/dillinger.js" ]
    },
    "CSS": {
      "DIST_DIR": "./public/css",
      "style": [ "./public/css/style.css" ]
    }
  })
  .done(function(){
    console.log('\nSmoosh all finished...\n')
  })
  
}

cleaner()
setTimeout(smoosher,750)
