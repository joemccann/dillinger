var fs = require('fs'),
    sys = require('util'),
    exec = require('child_process').exec,
    stylus = require('stylus'),
    fs = require('fs'),
    smoosh = require('smoosh'),
    path = require('path')

var appConfig = JSON.parse(fs.readFileSync(__dirname + '/app.json', 'UTF-8'))

// This should be the filename that is the single stylus file for production.
var productionStylusFile = __dirname + appConfig.CSS_PRODUCTION

setStylusImagePrefix(productionStylusFile)


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
      var d = data.replace(/imagePrefix=[A-Za-z0-9-:"'\.\/\\]+/i + 'imagePrefix="' + appConfig.IMAGE_PREFIX_PRODUCTION + '"')

       // write the file with the proper prefix.
       fs.writeFile(__dirname + appConfig.STYLUS_FILE, d, function(err,data){
        if(err) throw err
        else{
          
          console.log(appConfig.STYLUS_FILE.yellow + " file image prefix written successfully for production environment.\n")
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
                  console.log(productionFile.replace('.styl', '.css').yellow + " file written successfully for production environment.\n")

                  // run smoosh for production
                  smoosh.config('./app.json')
                  smoosh.build('compressed')

                } // end else

              }) // end write style.css file

          }) // end stylus.render()

        } // end writeFile else 
      
       }) // end writeFile()

    } // end readFile else

  }) // end readFile()

}
