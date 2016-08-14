"use strict"

const request = require('request')
	, _ = require('lodash')
	, path = require('path')
	, fs = require('fs')
	;

// Sponsored Object
function Sponsored(){

	this.sponsored_config_file = path.resolve(__dirname, '../../configs/sponsored/', 'sponsored-config.json')
	this.sponsored_config = {}
	this.isConfigEnabled = false

	// This fs call blocks so make sure you only instantiate the
	// instance of the sponsored object once.
	if( fs.existsSync(this.sponsored_config_file) ){
	  this.sponsored_config = require(this.sponsored_config_file)
	  this.isConfigEnabled = true
	  console.log('Sponsored config found in environment. Plugin enabled. (URL: "' + this.sponsored_config.url + '")')
	} 
	else if( process.env.sponsored_app_url !== undefined ){

	  this.sponsored_config = {
	    "url": process.env.sponsored_app_url
	  }

	  this.isConfigEnabled = true
	  console.log('Sponsored config found in environment. Plugin enabled. (URL: "' + this.sponsored_config.url + '")')
	} 
	else{
	  this.sponsored_config = {
	    "url": "YOUR_URL"
	  }
	  console.warn('Sponsored config not found at ' + this.sponsored_config_file + '. Plugin disabled.')
	}

} // end Sponsored object


// The fetchAd function does exactly that - fetches
// ad JSON for the ad
// @param cb is required
Sponsored.prototype.fetchAd = function fetchAd(cb){

  // nah dawg you need a callback
  if (!cb) {
    throw Error('fetchAd requires a callback function.')
  }

  // nah dawg, for real you need a callback that's a function
  if ( !_.isFunction(cb) ) {
    throw Error('fetchAd requires cb parameter to be a function')
  }

  // Go get the ad JSON
	request(this.sponsored_config.url, function adsFetchCb(err,response,body){
		if(err){ 
			throw new Error(err)
		}
		else if (response.statusCode > 399){
			throw new Error('Error. Response Code: ' + response.statusCode)
		}
		else{
			let adJSON
			try{
				adJSON = JSON.parse(body)
			}catch(e){
				throw new Error(e)
			} // end catch

			if(process.env.DEBUG) console.log(generateAdHTML(adJSON.ads[0]))
			else cb(adJSON.ads[0]) // based on buysellads JSON

		} // end else
	}) // end request
  
} // end fetchAd

// Helper to generate the HTML for the ad
Sponsored.prototype.generateAdHTML = function generateAdHTML(json){
	return '<a href="'+json.statlink+'" rel="nofollow" target="_blank">'
	+json.description+'</a><img src="'
	+json.pixel+'" />'
}

module.exports = new Sponsored()