module.exports =
  angular
    .module('diBase.controllers.about', [])
    .controller('WTFisDillingerModalInstance', (
      $scope, $modalInstance) => {
      $scope.ok = () => {
        return $modalInstance.close()
      }

      $scope.cancel = () => {
        return $modalInstance.dismiss('cancel')
      }
    })
