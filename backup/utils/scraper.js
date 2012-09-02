var request = require('request')
  , jsdom = require('jsdom')

var config = {}

function Scraper(){
  
  return {
    getMdLinks: function(url, res){
      
      request( url, function (error, response, body) {

        if (error && response.statusCode !== 200) {
          console.log('Error when contacting ' + url)
          res.send(response.statusCode)
        }
        else{

          jsdom.env({
            html: body,
            scripts: [
              'http://ajax.googleapis.com/ajax/libs/jquery/1.7/jquery.js'
            ]
          }, function (err, window) {
            
            var $ = window.jQuery
              , ret = []
          
            $('.tree-browser td.content a').each(function(i,el){
            
              var test =  /(\.md)|(\.markdown)/i.exec( $(el).attr('href') )

              if(  test  ) {
                var link = 'https://raw.github.com' + $(el).attr('href').replace('/blob', '') // utterly hacky
                ret.push(link) // TODO: FIX THIS AS WE AREN'T USING IT YET
                console.log(link)
              }
              
                
            }) // end each
          
            // Now request the raw link
            if(!ret.length) res.send("No results!")
            else{
              console.log("\n\n"+ret[0]+"\n\n")
              request(ret[0], function(err, response, b){
            
                if (error && response.statusCode !== 200) {
                  console.log('Error when contacting ' + link)
                  res.send('Error when contacting ' + link)
                }
                else{
                  console.log(b)
                  res.contentType('text/plain');
                  res.send(b) // send back since we passed in the response object
                }

              }) // end request raw link

            } // end else for length

          }); // end jsDom.env
          
        } // end else request github page

      }); // end request github page
      
    } // end getMdLinks()

  } // end API
  
} // end Blog()

exports.scraper = new Scraper()