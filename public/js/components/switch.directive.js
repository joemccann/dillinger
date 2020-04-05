const template = require('./switch.directive.html')

module.exports =
  angular
    .module('diBase.directives.switch', [])
    .directive('switch', () => {
      return {
        restrict: 'AE',
        replace: true,
        scope: {
          toggleValue: '=value'
        },
        template
      }
    })
