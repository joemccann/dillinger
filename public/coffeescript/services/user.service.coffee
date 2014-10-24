
'use strict'

app = require('../dillinger')

module.exports = app.factory 'userService',
  ->

    defaults =
      enableAutoSave:   true
      enableWordsCount: true
      enableNightMode:  false

    service =
      profile: {}
      save: ->
        sessionStorage.setItem('profile', angular.toJson(service.profile))
        return
      restore: ->
        service.profile = angular.fromJson(sessionStorage.getItem('profile')) or defaults
        return service.profile

    service.restore()

    return service
