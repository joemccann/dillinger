
'use strict'

Dillinger = require('../dillinger')

module.exports = Dillinger.controller 'UserController',
  ($scope, $rootScope, $timeout, UserService, DocService, Wordcounter) ->

    $scope.user = UserService.user

    toggleAutoSave = ->
      $scope.user.AutoSave = !$scope.user.AutoSave
      UserService.save()

    toggleWordCount = ->
      $scope.user.WordCount = !$scope.user.WordCount
      UserService.save()

    toggleNightMode = ->
      $scope.user.NightMode = !$scope.user.NightMode
      UserService.save()

    resetProfile = ->
      sessionStorage.clear()
      window.location.reload()
      false

    updateWords = ->
      $rootScope.words = Wordcounter.count()
      $timeout ->
        $scope.$apply()
      , 0

    $scope.toggleAutoSave = toggleAutoSave
    $scope.toggleWordCount = toggleWordCount
    $scope.toggleNightMode = toggleNightMode
    $scope.resetProfile = resetProfile

    $rootScope.$on 'preview.updated', updateWords

    return
