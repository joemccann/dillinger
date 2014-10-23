
'use strict'

module.exports =
  angular
  .module('documents.export.service', ['documents.service'])
  .factory 'documentsExportService',
  ($http, documentsService) ->

    service =

      type: null
      file: null

      fetchHTML: (styled) ->
        $http.post('factory/fetch_html',
          name: documentsService.getCurrentDocumentTitle()
          unmd: documentsService.getCurrentDocumentBody()
          formatting: if styled then styled else false
        )
        .success (response) ->
          service.type = 'html'
          service.file = response.data
        .error (err) ->
          console.log err
          err

      fetchPDF: ->
        $http.post('factory/fetch_pdf',
          name: documentsService.getCurrentDocumentTitle()
          unmd: documentsService.getCurrentDocumentBody()
        )
        .success (response) ->
          service.type = 'pdf'
          service.file = response.data
        .error (err) ->
          console.log err
          err

      fetchMarkdown: ->
        $http.post('factory/fetch_markdown',
          name: documentsService.getCurrentDocumentTitle()
          unmd: documentsService.getCurrentDocumentBody()
        )
        .success (response) ->
          service.type = 'md'
          service.file = response.data
        .error (err) ->
          console.log err
          err

    return service

