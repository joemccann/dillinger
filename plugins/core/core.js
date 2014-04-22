var fs = require('fs')
  , path = require('path')
  , request = require('request')
  , qs = require('querystring')
  , markdown = require('marked')
  , phantomjs = require('phantomjs')
  , child = require('child_process')

markdown.setOptions({
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false,
  highlighter: function(code) {
    return require('highlight.js').highlightAuto(code).value;
  }
})


exports.Core = (function(){
  
  function _generateRandomMdFilename(ext){
    return 'dillinger_' +(new Date()).toISOString().replace(/[\.:-]/g, "_")+ '.' + ext
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

      // TODO: maybe change this to user submitted filename or name of repo imported file?
      var name = _generateRandomMdFilename('md') 
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

      var html = _getHtml(req.body.unmd)  

      var name = _generateRandomMdFilename('html') 

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

      var html = _getHtml(unmd)
      var temp = path.resolve(__dirname, '../../public/files/pdf/temp.html')

      fs.writeFile( temp, html, 'utf8', function(err, data){

        if(err){
          json_response.error = true
          json_response.data = "Something wrong with the pdf conversion."
          console.error(err)
          res.json( json_response )
        }
        else{
          var name = _generateRandomMdFilename('pdf')
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
