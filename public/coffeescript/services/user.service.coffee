
'use strict'

module.exports =
  angular
  .module('diUser.service', [])
  .factory 'userService',
  ->

    defaults =
      enableAutoSave:   true
      enableWordsCount: true
      enableNightMode:  false

    service =
      profile: {}
      save: ->
        localStorage.setItem('profile', angular.toJson(service.profile))
        return
      restore: ->
        service.profile = angular.fromJson(localStorage.getItem('profile')) or defaults
        return service.profile

    service.restore()

    return service
