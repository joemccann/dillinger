var markdown = require('node-markdown').Markdown

var config = {}

function Md(){
  
  return {
    generateRandomMdFilename: function(ext){
      return 'dillinger_' +(new Date()).toISOString().replace(/[\.:-]/g, "_")+ '.' + ext
    },
    getHtml: function(str){
      // console.log(str)
      return markdown(str) 
    }

  } // end API
  
} // end Md()

exports.md = new Md()