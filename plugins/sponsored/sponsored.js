"use strict"

const request = require('request')
	, _ = require('lodash')
	, path = require('path')
	, fs = require('fs')
	, GA = require('../googleanalytics/googleanalytics.js')
	;

// Sponsored Object
function Sponsored(){

	this.sponsored_config_file = path.resolve(__dirname, '../../configs/sponsored/', 'sponsored-config.json')
	this.sponsored_config = {}
	this.isConfigEnabled = false

	let self = this

	function _isUrlExistent(){
		return self.sponsored_config.url
	}

	// This fs call blocks so make sure you only instantiate the
	// instance of the sponsored object once.
	if( fs.existsSync(this.sponsored_config_file) ){
	  this.sponsored_config = require(this.sponsored_config_file)
	  
	  if(_isUrlExistent()){
		  this.isConfigEnabled = true
		  console.log('Sponsored config found in file. Plugin enabled. (URL: "' + this.sponsored_config.url + '")')
	  }
	  else console.warn('Sponsored URL not found in your config file. Plugin disabled.')

	} 
	else if( process.env.sponsored_app_url !== undefined ){

	  this.sponsored_config = {
	    "url": process.env.sponsored_app_url
	  }

	  if( _isUrlExistent() ){
		  this.isConfigEnabled = true
		  console.log('Sponsored config found in environment. Plugin enabled. (URL: "' + this.sponsored_config.url + '")')
	  }
	  else console.warn('Sponsored URL not found in your environment variables. Plugin disabled.')

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
// @string forwardedIp is required
// @param cb is required
Sponsored.prototype.fetchAd = function fetchAd(forwardedIp, cb){

  // nah dawg you need a forwarded IP address
  if (!forwardedIp) {
    throw Error('fetchAd requires a forwarded IP address.')
  }

  // nah dawg you need a callback
  if (!cb) {
    throw Error('fetchAd requires a callback function.')
  }

  // nah dawg, for real you need a callback that's a function
  if ( !_.isFunction(cb) ) {
    throw Error('fetchAd requires cb parameter to be a function')
  }

  let sponsoredUrl

  // When testing...
  if(forwardedIp == '127.0.0.1'){
  	// BuySellAds sends a DIFFERENT payload if you send
  	// 127.0.0.1 as the forwardedIP :facepalm:
	  let tempIp = '173.244.209.21'
  	sponsoredUrl = this.sponsored_config.url + "?forwardedip=" + tempIp
  }else{
		sponsoredUrl = this.sponsored_config.url + "?forwardedip=" + forwardedIp
  }

  // Go get the ad JSON
	request(sponsoredUrl, function adsFetchCb(err,response,body){
		
		let adJSON = {}
		
		if(err){ 
			console.error('Error on fetching ad. ' + err)
			return cb(null)
		}
		else if (response.statusCode > 399){
			console.error(new Error('Error on fetching ad. Response Code: ' + response.statusCode))
			return cb(null)
		}
		else{
			try{
				adJSON = JSON.parse(body)
			}catch(e){
				throw new Error(e)
			} // end catch

			if(process.env.DEBUG) console.log( generateAdHTML(adJSON.ads[0]) )
			else cb(adJSON.ads[0]) // based on buysellads JSON

		} // end else
	}) // end request
  
} // end fetchAd

// Helper to generate the HTML for the ad
function generateAdHTML(ad){

	if(!ad) return ''

	let html, imgs = ''

	/* pixel: string, with || delimiters to split into an array */
	// try{
	// 	let pixels = json.pixel.split('||')

	// 	let time = Math.round(Date.now() / 10000)

	// 	let pixelArrLen = pixels.length

	// 	for (var j = 0; j < pixelArrLen; j++){

	// 		let src = pixels[j].replace('[timestamp]', time)
		
	// 		imgs += '<img src="' +src+'" />'

	// 	}

	try{
		
		// Add track clicks logic if enabled...
		if(GA.isConfigEnabled){
			html = 	'<a href="'+ad.statlink+'" onClick="trackOutboundLink(\''
							+ad.statlink+'\'); return false;" rel="nofollow" target="_blank">'
							+ad.description+'</a>'
							+imgs

		}
		else{
			html = '<a href="'+ad.statlink+'" rel="nofollow" target="_blank">'
							+ad.description+'</a>'
							+imgs
		}

	}catch(e){
		console.warn("Something went awry with the json from ad provider.")
		console.error(e)
		html = ''		
	}
	return html

}

Sponsored.prototype.generateAdHTML = generateAdHTML

module.exports = new Sponsored()