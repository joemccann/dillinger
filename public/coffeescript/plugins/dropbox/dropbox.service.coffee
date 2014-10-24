
'use strict'

module.exports =
  angular
  .module('plugins.dropbox.service', [])
  .factory 'dropboxService',
  ($http) ->

    defaults =
      files: []

    service =
      fetched:
        fileName: ""
        file: null
      fetchFile: (mdFile) ->
        $http.post('fetch/dropbox',
          mdFile: mdFile
        )
        .success (data) ->
          service.fetched.file = data.data
        .error (err) ->
          console.log err
          err
      fetchFiles: ->
        $http.post('import/dropbox',
          fileExts: 'md'
        )
        .success (data) ->
          service.files = data
        .error (err) ->
          console.log err
          err
      save: ->
        sessionStorage.setItem('dropbox', angular.toJson(service.fetched))
        return

      restore: ->
        service.fetched = angular.fromJson(sessionStorage.getItem('dropbox')) or defaults
        return service.fetched

    service.restore()

    return service
