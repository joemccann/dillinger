module.exports =
  angular
  .module('diFileImport', [
    'diFileImport.directives.choose',
    'diFileImport.directives.dnd'
  ])
  .controller('ImportFile', function($scope, $rootScope) {
    $scope.choose = function() {
      $rootScope.$emit('importFile.choose');
    };
  });
