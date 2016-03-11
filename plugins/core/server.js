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

   res.attachment( name );
   res.end( unmd );
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

    res.attachment( name );
    res.end( html );
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
            res.attachment( name );
            res.sendFile(filename);
          }
        })
      }
    })
  }

/* Start Dillinger Routes */

// Download a markdown file directly as response.
app.post('/factory/fetch_markdown', fetchMd)

// Download an html file directly as response.
app.post('/factory/fetch_html', fetchHtml)

// Download a pdf file directly as response.
app.post('/factory/fetch_pdf', fetchPdf)

/* End Dillinger Core */
