
'use strict'

var path = require('path')

module.exports = (name) => {
  return /(\.(js|coffee)$)/i.test(path.extname(name))
}
