'use strict';

var express = require('express')
  , app = module.exports = express()
  , fs = require('fs')
  , path = require('path')
  , md = require('./markdown-it.js').md
  , temp = require('temp')
  , phantom = require('phantom')
  ;

  var phantomSession = phantom.create()
  function getPhantomSession() {
    return phantomSession
  }

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

    if (req.body.preview === 'false') {
      res.attachment( name );
    } else {
      // We don't use text/markdown because my "favorite" browser
      // (IE) ignores the Content-Disposition: inline; and prompts
      // the user to download the file.
      res.type('text');

      // For some reason IE and Chrome ignore the filename
      // field when Content-Type: text/plain;
      res.set('Content-Disposition', `inline; filename="${name}"`);
    }

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

    if (req.body.preview === 'false') {
      res.attachment( name );
    } else {
      res.type('html');
      res.set('Content-Disposition', `inline; filename="${name}"`);
    }

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
    var tempPath = temp.path({suffix: '.htm'})
    fs.writeFile( tempPath, html, 'utf8', function fetchPdfWriteFileCb(err, data) {
      if(err) {
        console.error(err);
        res.end("Something wrong with the pdf conversion.");
      } else {
         _createPdf(req, res, tempPath);
      }
    });
  }

  function _createPdf(req, res, tempFilename) {
    getPhantomSession().then(phantom => {
      return phantom.createPage();
    }).then(page => {
      page.open( tempFilename ).then(status => {
        _renderPage(page);
      });
    });

    function _renderPage(page) {
      var name = req.body.name.trim() + '.pdf'
      var filename = temp.path({suffix: '.pdf'})

      page.property('paperSize', { format: 'A4', orientation: 'portrait', margin: '1cm' })
      page.property('viewportSize', { width: 1024, height: 768 })

      page.render(filename).then(function() {
        if (req.body.preview === 'false') {
          res.attachment( name )
        } else {
          res.type('pdf')
          res.set('Content-Disposition', `inline; filename="${name}"`)
        }

        res.sendFile( filename, {}, function() {
          // Cleanup.
          fs.unlink(filename)
          fs.unlink(tempFilename)
        });

        page.close()
      });
    }
  }

/* Start Dillinger Routes */

// Download a markdown file directly as response.
app.post('/factory/fetch_markdown', fetchMd)

// Download an html file directly as response.
app.post('/factory/fetch_html', fetchHtml)

// Download a pdf file directly as response.
app.post('/factory/fetch_pdf', fetchPdf)

/* End Dillinger Core */
