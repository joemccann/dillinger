
'use strict'

module.exports =
  angular
  .module('plugins.googledrive.modal', ['plugins.googledrive.service'])
  .filter('startFrom', ->
    (input, start) ->
      if input
        start = +start # parse to int
        input.slice(start)
  )
  .controller 'GoogledriveModal',
  ($scope, $modalInstance, googledriveService, filterFilter) ->

    vm = @

    vm.title = "Google Drive"

    vm.allFiles       = googledriveService.files
    vm.allFilesLength = googledriveService.files.length

    vm.paginatedFiles       = []

    vm.currentPage  = 1
    vm.itemsPerPage = 16
    vm.maxSize      = 5

    vm.query = undefined

    vm.onPageChange = ->
      console.log vm.query
      vm.paginatedFiles = filterFilter(vm.allFiles, vm.query)

    vm.setFile = ->
      $modalInstance.close()

    vm.fetchFile = (fileName) ->
      googledriveService.fetched.fileName = fileName.split('/').pop()
      googledriveService.fetchFile(fileName)
        .then(vm.setFile)

    vm.close = ->
      $modalInstance.dismiss('cancel')

    vm.onPageChange()

    return
