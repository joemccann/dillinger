'use strict'

const path = require('path')
const fs = require('fs')
const { log, warn } = console

//
// Sponsored Object
//
function Sponsored() {
  const self = this

  function _isKeyExistent() {
    return self.key
  }

  if (process.env.SPONSORED_KEY) {
    this.key = process.env.SPONSORED_KEY

    if (_isKeyExistent()) {
      log('Sponsored config found in environment variables. ' +
        `Plugin enabled. (KEY: "${this.key}")`)
    } else {
      warn('Sponsored KEY not found in your environment variables. ' +
        +'Plugin disabled.')
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
    warn('Sponsored config not found. Plugin disabled.')
  }
} // end Sponsored object

module.exports = new Sponsored()
