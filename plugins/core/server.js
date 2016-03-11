var express = require('express')
  , app = module.exports = express()
  , fs = require('fs')
  , path = require('path')
  , request = require('request')
  , qs = require('querystring')
  , phantomjs = require('phantomjs')
  , child = require('child_process')
  , md = require('./markdown-it.js').md
  ;

  function _getFullHtml(name, str, style) {
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'
      + name + '</title><style>'
      + ( ( style ) ? style : '' ) + '</style></head><body id="preview">\n'
      + md.render(str) + '\n</body></html>';
  }

  function _getHtml(str) {
    return md.render(str)
  }

  // Move this into _getFormat() to reload the CSS without restarting node.
  var _format = fs.readFileSync( path.resolve(__dirname, '../../public/css/app.css') ).toString('utf-8');
  function _getFormat() {
      return _format;
  }

    var fetchMd = function(req, res) {

      var unmd = req.body.unmd
        , json_response =
        {
          data: ''
        , error: false
        }

      var name = req.body.name.trim()

      if(!name.includes('.md')){
        name = name + '.md'
      }

      var filename = path.resolve(__dirname, '../../downloads/files/md/' + name )

      // TODO: THIS CAN BE OPTIMIZED WITH PIPING INSTEAD OF WRITING TO DISK
      fs.writeFile( filename, unmd, 'utf8', function fetchMdWriteFileCb(err, data){

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
    }

    var downloadMd = function(req, res) {

      var fileId = req.params.mdid

      var filePath = path.resolve(__dirname, '../../downloads/files/md/' + fileId )

      res.download(filePath, fileId, function downloadMdDownloadCb(err){
        if(err) {
          console.error(err)
          res.status(err.status).send(err.code)
        }
        else{
          // Delete the file after download
          setTimeout(function unlinkCbInSetTimeout(){

            fs.unlink(filePath, function(err, data){
              if(err) return console.error(err)
              console.log(filePath + " was unlinked")

            },60000) // end unlink

          }) // end setTimeout

        } // end else

      }) // end res.download

    }

    var fetchHtml = function(req, res) {
      var unmd = req.body.unmd
        , json_response =
        {
          data: ''
        , error: false
        }

      // For formatted HTML or not...
      var format = req.body.formatting ? _getFormat() : "";

      var html = _getFullHtml(req.body.name, unmd, format);

      var name = req.body.name.trim() + '.html'

      var filename = path.resolve(__dirname, '../../downloads/files/html/' + name )

      fs.writeFile( filename, html, 'utf8', function writeFileCbFetchHtml(err, data){

        if(err){
          json_response.error = true
          json_response.data = "Something wrong with the markdown conversion."
          console.error(err)
          res.json( json_response )
        }
        else{
          json_response.data = name
          res.json( json_response )
         }
      }) // end writeFile
    }

    var fetchHtmlDirect = function(req, res) {

      var unmd = req.body.unmd
        , json_response =
        {
          data: ''
        , error: false
        }

      var html = _getHtml(req.body.unmd)

      json_response.data = html
      res.json( json_response )
    }

    var downloadHtml = function(req, res){

      var fileId = req.params.html

      var filePath = path.resolve(__dirname, '../../downloads/files/html/' + fileId )

      res.download(filePath, fileId, function downloadHtmlDownloadCb(err){
        if(err) {
          console.error(err)
          res.status(err.status).send(err.code)
        }
        else{

          // Delete the file after download
          setTimeout(function unlinkDownloadHtmlCb(){

            fs.unlink(filePath, function(err, data){
              if(err) return console.error(err)
              console.log(filePath + " was unlinked")

            },60000) // end unlink

          }) // end setTimeout

        } // end else

      }) // end res.download

    }

    var fetchPdf = function(req, res) {

      var unmd = req.body.unmd
        , json_response =
      {
        data: ''
      , error: false
      }

      var html = _getFullHtml(req.body.name, unmd, _getFormat())
      var temp = path.resolve(__dirname, '../../downloads/files/pdf/temp.html')

      fs.writeFile( temp, html, 'utf8', function fetchPdfWriteFileCb(err, data) {

        if(err) {
          json_response.error = true
          json_response.data = "Something wrong with the pdf conversion."
          console.error(err)
          res.json( json_response )
        }
        else {
          var name = req.body.name.trim() + '.pdf'
          var filename = path.resolve(__dirname, '../../downloads/files/pdf/' + name)

          var childArgs = [
            path.join(__dirname, 'render.js'),
            temp,
            filename
          ]

          child.execFile(phantomjs.path, childArgs, function childExecFileCb(err, stdout, stderr) {
            if(err) {
              json_response.error = true
              json_response.data = "Something wrong with the pdf conversion."
              console.error(err)
              res.json( json_response )
            }
            else {
              json_response.data = name
              res.json( json_response )
            }
          })
        }
      })
    }

    var downloadPdf = function(req, res) {

      var fileId = req.params.pdf

      var filePath = path.resolve(__dirname, '../../downloads/files/pdf/' + fileId)

      res.download(filePath, fileId, function downloadPdfDownloadCb(err){
        if(err) {
          console.error(err)
          res.status(err.status).send(err.code)
        }
        else{
          setTimeout(function unlinkDownloadPdfCb(){
            fs.unlink(filePath, function(err, data){
              if(err) return console.error(err)
              console.log(filePath + " was unlinked")
            })
          })
        }
      })
    } // end

/* Start Dillinger Routes */

// save a markdown file and send header to download it directly as response
app.post('/factory/fetch_markdown', fetchMd)

// Route to handle download of md file
app.get('/files/md/:mdid', downloadMd)

// Save an html file and send header to download it directly as response
app.post('/factory/fetch_html', fetchHtml)

app.post('/factory/fetch_html_direct', fetchHtmlDirect)

// Route to handle download of html file
app.get('/files/html/:html', downloadHtml)

// Save a pdf file and send header to download it directly as response
app.post('/factory/fetch_pdf', fetchPdf)

// Route to handle download of pdf file
app.get('/files/pdf/:pdf', downloadPdf)

/* End Dillinger Core */
