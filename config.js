var rc = require('rc');
var defaultConfig = {
  // googleWebmasterMeta: 'your google site verification content string - used for enabling Google Webmaster tools on the site',
};
module.exports = function() {
  return rc('dillinger', defaultConfig);
}
