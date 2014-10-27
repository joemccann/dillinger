
'use strict'

marked = require 'marked'

module.exports =
  angular
  .module('diBase.controllers.about', [])
  .controller 'WTFisDillingerModalInstance',
  ($scope, $modalInstance) ->

    $scope.ok = ->
      $modalInstance.close()

    $scope.cancel = ->
      $modalInstance.dismiss('cancel')

    return
