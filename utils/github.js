var markdown = require('node-markdown').Markdown

var config = {}

function Github(){
  
  return {
    fetchRepos: function(str){
      // console.log(str)
      return markdown(str) 
    }

  } // end API
  
} // end Github()

exports.github = new Github()