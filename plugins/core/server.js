var express = require('express')
  , app = module.exports = express()
  , fs = require('fs')
  , path = require('path')
  , request = require('request')
  , qs = require('querystring')
  , phantomjs = require('phantomjs')
  , child = require('child_process')
  , md = require('./markdown-it.js').md
  ,	debug = require('debug')('dillinger:core')  
  // , Core = require('./core.js').Core
  ;


console.warn('core server file...')

var Kore = function(){

  function _getFullHtml(name, str, style){
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'
      + name + '</title><style>'
      + ( ( style ) ? style : '' ) + '</style></head><body id="preview">\n'
      + md.render(str) + '\n</body></html>';
  }

  function _getHtml(str){
    return md.render(str)
  }

  return {
    fetchMd: function(req,res){

			console.warn('fetchmd...')

      var unmd = req.body.unmd
        , json_response =
        {
          data: ''
        , error: false
        }

      var name = req.body.name.trim() + '.md'
      var filename = path.resolve(__dirname, '../../public/files/md/' + name )

      // TODO: THIS CAN BE OPTIMIZED WITH PIPING INSTEAD OF WRITING TO DISK
      fs.writeFile( filename, unmd, 'utf8', function(err, data){

        if(err){
          json_response.error = true
          json_response.data = "Something wrong with the markdown conversion."
          res.send( JSON.stringify( json_response) )
          console.error(err)
        }
        else{
          json_response.data = name
          res.send( JSON.stringify( json_response) )
         }
      }) // end writeFile
    },
    downloadMd: function(req,res){
		
		console.warn('download md...')

      var fileId = req.params.mdid

      var filePath = path.resolve(__dirname, '../../public/files/md/' + fileId )

      res.download(filePath, fileId, function(err){
        if(err) {
          console.error(err)
          res.status(err.status).send(err.code)
        }
        else{

          debug('sending markdown via download...')

          // Delete the file after download
          setTimeout(function(){

            fs.unlink(filePath, function(err, data){
              if(err) return console.error(err)
              console.log(filePath + " was unlinked")

            },60000) // end unlink

          }) // end setTimeout

        } // end else

      }) // end res.download

    },
    fetchHtml: function(req,res){

			console.warn('fetch html...')

      var unmd = req.body.unmd
        , json_response =
        {
          data: ''
        , error: false
        }

      // For formatted HTML or not...
      var format = req.body.formatting;

      if ( ! format ) {
        format = "";
      } else {
        format = fs.readFileSync( path.resolve(__dirname, '../../public/css/app.css') ).toString('utf-8');
      }

      var html = _getFullHtml(req.body.name, unmd, format);

      var name = req.body.name.trim() + '.html'

      var filename = path.resolve(__dirname, '../../public/files/html/' + name )

      fs.writeFile( filename, html, 'utf8', function(err, data){

      	console.warn('writing file')

        if(err){
          json_response.error = true
          json_response.data = "Something wrong with the markdown conversion."
          console.error(err)
          res.json( json_response )
        }
        else{
					console.warn('write file html else...')
          json_response.data = name
          console.dir(json_response)
          res.json( json_response )
         }
      }) // end writeFile
    },
    fetchHtmlDirect: function(req,res){
    	console.warn('fetchhtmldirect...')
      var unmd = req.body.unmd
        , json_response =
        {
          data: ''
        , error: false
        }

      var html = _getHtml(req.body.unmd)

      json_response.data = html
      res.json( json_response )
    },
    downloadHtml: function(req,res){
      
			console.warn('download html...')
      var fileId = req.params.html

      var filePath = path.resolve(__dirname, '../../public/files/html/' + fileId )

  		var file = filePath;


  		return res.download(file); // Set disposition and send it.


			console.warn('download html...')
			var mime = require('mime');
      
      var fileId = req.params.html

      var filePath = path.resolve(__dirname, '../../public/files/html/' + fileId )

  		var file = filePath;

  		var filename = path.basename(file);
  		var mimetype = mime.lookup(file);

  		res.setHeader('Content-disposition', 'attachment; filename=' + filename);
  		res.setHeader('Content-type', mimetype);

  		var filestream = fs.createReadStream(file);
  		filestream.pipe(res);

      setTimeout(function(){

        fs.unlink(filePath, function(err, data){
          if(err) return console.error(err)
          console.log(filePath + " was unlinked")

        },60000) // end unlink

  		}) // end setTimeout
      // res.download(filePath, fileId, function(err){
      //   if(err) {
      //     console.error(err)
      //     res.status(err.status).send(err.code)
      //   }
      //   else{

      //     // Delete the file after download
      //     setTimeout(function(){

      //       fs.unlink(filePath, function(err, data){
      //         if(err) return console.error(err)
      //         console.log(filePath + " was unlinked")

      //       },60000) // end unlink

      //     }) // end setTimeout

      //   } // end else

      // }) // end res.download

    },
    fetchPdf: function(req,res){

			console.warn('fetch pdf...')

      var unmd = req.body.unmd
        , json_response =
      {
        data: ''
      , error: false
      }

      var format = fs.readFileSync( path.resolve(__dirname, '../../public/css/app.css') ).toString('utf-8')
      var html = _getFullHtml(req.body.name, unmd, format)
      var temp = path.resolve(__dirname, '../../public/files/pdf/temp.html')

      fs.writeFile( temp, html, 'utf8', function(err, data){

        if(err){
          json_response.error = true
          json_response.data = "Something wrong with the pdf conversion."
          console.error(err)
          res.json( json_response )
        }
        else{
          var name = req.body.name.trim() + '.pdf'
          var filename = path.resolve(__dirname, '../../public/files/pdf/' + name)

          var childArgs = [
            path.join(__dirname, 'render.js'),
            temp,
            filename
          ]

          child.execFile(phantomjs.path, childArgs, function(err, stdout, stderr) {
            if(err){
              json_response.error = true
              json_response.data = "Something wrong with the pdf conversion."
              console.error(err)
              res.json( json_response )
            }
            else{
              json_response.data = name
              res.json( json_response )
            }
          })
        }
      })
    },
    downloadPdf: function(req,res){

      console.warn('downloading pdf...')

      var fileId = req.params.pdf

      var filePath = path.resolve(__dirname, '../../public/files/pdf/' + fileId)

      console.log('adfsasdf')

      res.download(filePath, fileId, function(err){
        if(err) {
          console.error(err)
          res.status(err.status).send(err.code)
        }
        else{
          setTimeout(function(){
            fs.unlink(filePath, function(err, data){
              if(err) return console.error(err)
              console.log(filePath + " was unlinked")
            })
          })
        }
      })
    } // end
  }

}

const Core = new Kore();


/* Start Dillinger Routes */

// save a markdown file and send header to download it directly as response
app.post('/factory/fetch_markdown', Core.fetchMd)

// Route to handle download of md file
app.get('/files/md/:mdid', Core.downloadMd)

// Save an html file and send header to download it directly as response
app.post('/factory/fetch_html', Core.fetchHtml)

app.post('/factory/fetch_html_direct', Core.fetchHtmlDirect)

// Route to handle download of html file
// app.get('/files/html/:html', function(req,res){
// 			console.warn('download html...')
//       var fileId = req.params.html

//       var filePath = path.resolve(__dirname, '../../public/files/html/' + fileId )

//   		var file = filePath;


//   		return res.download(file); // Set disposition and send it.

// })
//Core.downloadHtml)

// Save a pdf file and send header to download it directly as response
app.post('/factory/fetch_pdf', Core.fetchPdf)

// // Route to handle download of pdf file
// app.get('/files/pdf/:pdf', Core.downloadPdf)

/* End Dillinger Core */

