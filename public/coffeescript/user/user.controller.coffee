
'use strict'

app = require('../dillinger')

module.exports = app.controller 'User',
  ($rootScope, $timeout, userService, wordsCountService) ->

    vm = @

    vm.profile = userService.profile

    toggleAutoSave = ->
      vm.profile.enableAutoSave = !vm.profile.enableAutoSave
      userService.save()

    toggleWordsCount = ->
      vm.profile.enableWordsCount = !vm.profile.enableWordsCount
      userService.save()

    toggleNightMode = ->
      vm.profile.enableNightMode = !vm.profile.enableNightMode
      userService.save()

    resetProfile = ->
      sessionStorage.clear()
      window.location.reload()
      false

    updateWords = ->
      $rootScope.words = wordsCountService.count()
      $timeout ->
        $rootScope.$apply()
      , 0

    vm.toggleAutoSave   = toggleAutoSave
    vm.toggleWordsCount = toggleWordsCount
    vm.toggleNightMode  = toggleNightMode
    vm.resetProfile     = resetProfile

    $rootScope.$on 'preview.updated', updateWords

    return
