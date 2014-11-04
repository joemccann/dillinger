
'use strict';

var path = require('path');

module.exports = function(name) {
  return /(\.(js|coffee)$)/i.test(path.extname(name));
};
