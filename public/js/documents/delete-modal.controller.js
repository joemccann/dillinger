
'use strict';

module.exports =
  angular
  .module('diDocuments.controllers', [])
  .controller('DeleteDialog', function($scope, $modalInstance) {

  $scope.ok = function() {
    $scope.procede();
    return $modalInstance.close();
  };

  $scope.cancel = function() {
    return $modalInstance.dismiss('cancel');
  };

});
