'use strict'

const path = require('path')
const fs = require('fs')
const { log, warn } = console

//
// Sponsored Object
//
function Sponsored () {
  this.sponsoredConfigFile = path.resolve(
    __dirname, '../../configs/sponsored/', 'sponsored-config.json')

  const self = this

  function _isKeyExistent () {
    return self.key
  }

  if (fs.existsSync(this.sponsoredConfigFile)) {
    const { key } = require(this.sponsoredConfigFile)
    this.key = key

    if (_isKeyExistent()) {
      log('Sponsored config found in file. Plugin enabled. ' +
`(URL: "${this.key}")`)
    } else {
      warn('Sponsored KEY not found in your config file. Plugin disabled.')
    }
  } else if (process.env.sponsored_key !== undefined) {
    this.key = process.env.sponsored_key

    if (_isKeyExistent()) {
      log('Sponsored config found in environment variables. ' +
`Plugin enabled. (KEY: "${this.key}")`)
    } else {
      warn('Sponsored KEY not found in your environment variables. ' +
+'Plugin disabled.')
    }
  } else {
    this.key = null
    warn('Sponsored config not found at ' +
`${this.sponsoredConfigFile}. Plugin disabled.`)
  }
} // end Sponsored object

module.exports = new Sponsored()
