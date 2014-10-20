
Dillinger = require('../dillinger')

DocService = Dillinger.factory 'DocService',
  ($rootScope, Doc) ->

    'use strict'

    currentDocument = {}
    files = []

    service =
      getItem: (item) ->
        files[files.indexOf(item)]
      getItemByIndex: (index) ->
        files[index]
      addItem: (item) ->
        files.push item
      removeItem: (item) ->
        files.splice(files.indexOf(item), 1)
      createItem: (props) ->
        new Doc(props)
      size: ->
        files.length
      getItems: ->
        files
      removeItems: ->
        files = []
        currentDocument = {}
        false
      setCurrentDocument: (item) ->
        currentDocument = item
      getCurrentDocument: ->
        currentDocument
      save: ->
        sessionStorage.setItem('files', angular.toJson(files))
        sessionStorage.setItem('currentDocument', angular.toJson(currentDocument))
      init: ->
        files           = angular.fromJson(sessionStorage.getItem('files')) or []
        currentDocument = angular.fromJson(sessionStorage.getItem('currentDocument')) or {}
        unless files?.length
          item = @createItem()
          @addItem(item)
          @setCurrentDocument(item)
          # @save()

    service.init()

    return service

module.exports = DocService
