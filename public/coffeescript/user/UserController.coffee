
Dillinger = require('../dillinger')

BaseCtrl = Dillinger.controller 'UserController',
  ($scope, UserService) ->

    'use strict'

    $scope.user = UserService.user

    return

module.exports = BaseCtrl
