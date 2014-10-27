
'use strict'

module.exports =
  angular
  .module('plugins.dropbox.service', [])
  .factory 'dropboxService',
  ($http, diNotify) ->

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
          diNotify(message: "An Error has happened: #{err}")
      fetchFiles: ->
        di = diNotify(message:"Fetching Markdown related files from Dropbox...", duration: 5000)
        $http.post('import/dropbox',
          fileExts: 'md'
        )
        .success (data) ->
          di?.$scope.$close()
          service.files = data
        .error (err) ->
          diNotify(message: "An Error has happened: #{err}")
      save: ->
        localStorage.setItem('dropbox', angular.toJson(service.fetched))
        return

      restore: ->
        service.fetched = angular.fromJson(localStorage.getItem('dropbox')) or defaults
        return service.fetched

    service.restore()

    return service
