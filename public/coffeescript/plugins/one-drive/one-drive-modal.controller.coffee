
'use strict'

module.exports =
  angular
  .module('plugins.onedrive.modal', ['plugins.onedrive.service'])
  .filter('startFrom', ->
    (input, start) ->
      if input
        start = +start # parse to int
        input.slice(start)
  )
  .controller 'OnedriveModal',
  ($scope, $modalInstance, onedriveService, filterFilter) ->

    vm = @

    vm.title = "Google Drive"

    vm.allFiles       = onedriveService.files
    vm.allFilesLength = onedriveService.files.length

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

    vm.fetchFile = (fileId, fileName) ->
      onedriveService.fetched.fileName = fileName.split('/').pop()
      onedriveService.fetchFile(fileId)
        .then(vm.setFile)

    vm.close = ->
      $modalInstance.dismiss('cancel')

    vm.onPageChange()

    return
