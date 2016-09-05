"use strict"

const path = require('path')
  , fs = require('fs')
  ;

// GoogleAnalytics Object
function GoogleAnalytics(){

  this.GoogleAnalytics_config_file = path.resolve(__dirname, '../../configs/googleanalytics/', 'googleanalytics-config.json')
  this.GoogleAnalytics_config = {}
  this.isConfigEnabled = false

  // This fs call blocks so make sure you only instantiate the
  // instance of the GoogleAnalytics object once.
  if( fs.existsSync(this.GoogleAnalytics_config_file) ){
    this.GoogleAnalytics_config = require(this.GoogleAnalytics_config_file)
    this.isConfigEnabled = true
    console.log('GoogleAnalytics config found in file. Plugin enabled. (UAID: "' 
      + this.GoogleAnalytics_config.UAID + '")')
  } 
  else if( process.env.GoogleAnalytics_app_url !== undefined ){

    this.GoogleAnalytics_config = {
      "url": process.env.GoogleAnalytics_app_url
    }

    this.isConfigEnabled = true
    console.log('GoogleAnalytics config found in environment. Plugin enabled. (UAID: "' 
      + this.GoogleAnalytics_config.UAID + '")')
  } 
  else{
    this.GoogleAnalytics_config = {
      "UAID": "YOUR_UAID"
    }
    console.warn('GoogleAnalytics config not found at ' 
      + this.GoogleAnalytics_config_file + '. Plugin disabled.')
  }

} // end GoogleAnalytics object


// Helper to generate the JS for the GA tracking
GoogleAnalytics.prototype.generateGATrackingJS = function generateGATrackingJS(){
 
  return `
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

    ga('create', '${this.GoogleAnalytics_config.UAID}', 'auto');
    ga('send', 'pageview');
  `
}

GoogleAnalytics.prototype.generateTrackSponsoredLinkClicks = function generateTrackSponsoredLinkClicks(){

  return `var trackOutboundLink = function(url) {
    ga('send', 'event', 'outbound', 'click', url, {
      'transport': 'beacon',
      'hitCallback': function(){window.open(url);}
    });
    }`

}

module.exports = new GoogleAnalytics()