
Dillinger = require('../../dillinger')

documentTitle = Dillinger.directive 'documentTitle',
  () ->

    directive =
      restrict: 'E'
      templateUrl: '../coffeescript/document/templates/document-title.html'

    return directive

module.exports = documentTitle
