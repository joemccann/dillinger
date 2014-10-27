
'use strict'

module.exports =
  angular
  .module('plugins.onedrive.service', [])
  .factory 'onedriveService',
  ($http, diNotify) ->

    defaults =
      files: []

    service =
      fetched:
        fileName: ""
        file: null
      fetchFile: (fileId, fileName) ->
        $http.get("fetch/onedrive?fileId=#{fileId}")
        .success (data) ->
          service.fetched.file = data.content
        .error (err) ->
          diNotify(message: "An Error has happened: #{err}")
      fetchFiles: ->
        di = diNotify(message:"Fetching Markdown related files from One Drive...", duration: 5000)
        $http.get('import/onedrive')
        .success (data) ->
          di?.$scope.$close()
          service.files = data.data or []
        .error (err) ->
          diNotify(message: "An Error has happened: #{err}")
      save: ->
        sessionStorage.setItem('onedrive', angular.toJson(service.fetched))
        return

      restore: ->
        service.fetched = angular.fromJson(sessionStorage.getItem('onedrive')) or defaults
        return service.fetched

    service.restore()

    return service
