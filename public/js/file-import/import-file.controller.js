module.exports =
  angular
    .module('diFileImport', [
      'diFileImport.directives.choose',
      'diFileImport.directives.dnd'
    ])
    .controller('ImportFile', ($scope, $rootScope) => {
      $scope.choose = (isHtml) => {
        const htmlFileCheck = isHtml ? { isHtml: true } : null
        $rootScope.$emit('importFile.choose', htmlFileCheck)
      }
    })
