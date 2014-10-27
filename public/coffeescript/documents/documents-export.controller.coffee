
'use strict'

module.exports =
  angular
  .module('diDocuments.export', ['diDocuments.service', 'diDocuments.export.service'])
  .controller 'DocumentsExport',
  ($scope, documentsExportService) ->

    # 1. Self-reference
    vm = @

    # 2. Requirements
    $downloader = document.getElementById('downloader') # TODO: Make this a directive

    # 3. Scope Stuff

    # 3a. Set up watchers on the scope

    # 3b. Expose methods or data on the scope

    # 3c. Listen to events on the scope

    # 4. Expose methods and properties on the controller instance

    initDownload = ->
      $downloader.src = "/files/#{documentsExportService.type}/#{documentsExportService.file}"

    asHTML = (styled) ->
      documentsExportService
        .fetchHTML(styled)
        .then(initDownload)

    asStyledHTML = ->
      asHTML(true)

    asMarkdown = ->
      documentsExportService
        .fetchMarkdown()
        .then(initDownload)

    asPDF = ->
      documentsExportService
        .fetchPDF()
        .then(initDownload)

    # 5. Clean up
    $scope.$on '$destroy', ->
      vm     = null
      $scope = null

    vm.asHTML       = asHTML
    vm.asStyledHTML = asStyledHTML
    vm.asMarkdown   = asMarkdown
    vm.asPDF        = asPDF

    # 6. All the actual implementations go here.

    return
