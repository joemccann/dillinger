module.exports =
  angular
  .module('diFileImport', [
    'diFileImport.directives.choose',
    'diFileImport.directives.dnd'
  ])
  .controller('ImportFile', function($scope, $rootScope) {
    $scope.choose = function(isHtml) {
      var htmlFileCheck = isHtml ? {isHtml:true} : null
      $rootScope.$emit('importFile.choose', htmlFileCheck);
    };
  })
