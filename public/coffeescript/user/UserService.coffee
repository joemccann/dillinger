
Dillinger = require('../dillinger')

UserService = Dillinger.factory 'UserService',
  () ->

    'use strict'

    defaults =
      AutoSave: true
      WordCount: true
      NightMode: false
      Dropbox: {}           # Noch unklar was hier hin muss.
      OneDrive: {}          # Noch unklar was hier hin muss.
      GoogleDrive: {}       # Noch unklar was hier hin muss.
      Github: {}            # Noch unklar was hier hin muss.

    service =
      user: {}
      save: ->
        sessionStorage.profile =
          angular.toJson(service.user)
        return
      restore: ->
        service.user =
          angular.fromJson(sessionStorage.profile) or defaults
        return service.user

    service.restore()

    return service

module.exports = UserService
