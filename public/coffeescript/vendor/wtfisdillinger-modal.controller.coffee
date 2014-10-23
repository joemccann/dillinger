
'use strict'

app    = require('../dillinger')
marked = require 'marked'

module.exports = app.controller 'WTFisDillingerModalInstance',
  ($scope, $modalInstance) ->

    $scope.ok = ->
      $modalInstance.close()

    $scope.cancel = ->
      $modalInstance.dismiss('cancel')

    return
