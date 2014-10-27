
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
      saveFile: (title, body) ->
        di = diNotify(message:"Saving File to One Drive...", duration: 5000)
        $http.post('save/onedrive',
          title: title
          content: body
        )
        .success (data) ->
          console.log data
          di?.$scope.$close()
          if data.error?
            diNotify(message: "An Error occured: #{data.error.message}", duration: 3000)
          else
            diNotify(message: "Successfully saved File to One Drive", duration: 5000)
        .error (err) ->
          diNotify(message: "An Error occured: #{err}")
      fetchFile: (fileId, fileName) ->
        $http.get("fetch/onedrive?fileId=#{fileId}")
        .success (data) ->
          service.fetched.file = data.content
        .error (err) ->
          diNotify(message: "An Error occured: #{err}")
      fetchFiles: ->
        di = diNotify(message:"Fetching Markdown related files from One Drive...", duration: 5000)
        $http.get('import/onedrive')
        .success (data) ->
          di?.$scope.$close()
          service.files = data.data or []
        .error (err) ->
          diNotify(message: "An Error occured: #{err}")
      save: ->
        localStorage.setItem('onedrive', angular.toJson(service.fetched))
        return

      restore: ->
        service.fetched = angular.fromJson(localStorage.getItem('onedrive')) or defaults
        return service.fetched

    service.restore()

    return service
