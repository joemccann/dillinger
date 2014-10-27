
'use strict'

module.exports =
  angular
  .module('plugins.googledrive.service', [])
  .factory 'googledriveService',
  ($http, diNotify) ->

    defaults =
      files: []

    service =
      fetched:
        fileName: ""
        file: null
      fetchFile: (fileId) ->
        $http.get("fetch/googledrive?fileId=#{fileId}")
        .success (data) ->
          service.fetched.fileName = data.title
          service.fetched.file = data.content
        .error (err) ->
          diNotify(message: "An Error has happened: #{err}")
      fetchFiles: ->
        di = diNotify(message:"Fetching Markdown related files from Google Drive...", duration: 5000)
        $http.get('import/googledrive')
        .success (data) ->
          di?.$scope.$close()
          service.files = data.items or []
        .error (err) ->
          diNotify(message: "An Error has happened: #{err}")
      save: ->
        sessionStorage.setItem('googledrive', angular.toJson(service.fetched))
        return

      restore: ->
        service.fetched = angular.fromJson(sessionStorage.getItem('googledrive')) or defaults
        return service.fetched

    service.restore()

    return service
