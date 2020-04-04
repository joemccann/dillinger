
'use strict'

module.exports =
  angular
    .module('diBase.controllers.about', [])
    .controller('WTFisDillingerModalInstance', function ($scope, $modalInstance) {
      $scope.ok = function () {
        return $modalInstance.close()
      }

      $scope.cancel = function () {
        return $modalInstance.dismiss('cancel')
      }
    })
