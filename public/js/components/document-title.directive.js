const template = require('./document-title.directive.html')
module.exports =
  angular
    .module('diBase.directives.documentTitle', [])
    .directive('documentTitle', () => {
      return {
        restrict: 'E',
        template
      }
    })
