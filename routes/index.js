var path = require('path')
  , Core = require( path.resolve(__dirname, '../plugins/core/core.js') ).Core

exports.index = function(req, res){
  res.render('index')
}

exports.fetch_md = Core.fetchMd
exports.download_md = Core.downloadMd
exports.fetch_html = Core.fetchHtml
exports.download_html = Core.downloadHtml