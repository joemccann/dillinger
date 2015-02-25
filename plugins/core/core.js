var fs = require('fs')
  , path = require('path')
  , request = require('request')
  , qs = require('querystring')
  , markdown = require('marked')
  , phantomjs = require('phantomjs')
  , child = require('child_process')
  , hljs = require('highlight.js');

markdown.setOptions({
  gfm: true,
  tables: true,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false,
  langPrefix: 'lang-',
  highlight: function (code, lang, etc) {
    if (hljs.getLanguage(lang)) {
      code = hljs.highlight(lang, code).value;
    }
    return code;
  }
})


exports.Core = (function(){

  function _getFullHtml(name, str, style){
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>'
      + name + '</title><style>'
      + ( ( style ) ? style : '' ) + '</style></head><body>\n'
      + markdown(str) + '\n</body></html>';
  }

  function _getHtml(str){
    return markdown(str)
  }

  return {
    fetchMd: function(req,res){
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

      var fileId = req.params.mdid

      var filePath = path.resolve(__dirname, '../../public/files/md/' + fileId )

      res.download(filePath, fileId, function(err){
        if(err) {
          console.error(err)
          res.status(err.status).send(err.code)
        }
        else{

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
      var unmd = req.body.unmd
        , json_response =
        {
          data: ''
        , error: false
        }

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
    },
    fetchHtmlDirect: function(req,res){
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

      var fileId = req.params.html

      var filePath = path.resolve(__dirname, '../../public/files/html/' + fileId )

      res.download(filePath, fileId, function(err){
        if(err) {
          console.error(err)
          res.status(err.status).send(err.code)
        }
        else{

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
    fetchPdf: function(req,res){
      var unmd = req.body.unmd
        , json_response =
      {
        data: ''
      , error: false
      }

      var html = _getFullHtml(req.body.name, unmd)
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

      var fileId = req.params.pdf

      var filePath = path.resolve(__dirname, '../../public/files/pdf/' + fileId)

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

})()
