
'use strict'

module.exports =
  angular
  .module('plugins.dropbox.modal', ['plugins.dropbox.service'])
  .filter('startFrom', ->
    (input, start) ->
      if input
        start = +start # parse to int
        input.slice(start)
  )
  .controller 'DropboxModal',
  ($scope, $modalInstance, dropboxService, filterFilter) ->

    vm = @

    vm.title = "Dropbox"

    vm.allFiles       = dropboxService.files
    vm.allFilesLength = dropboxService.files.length

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
      dropboxService.fetched.fileName = fileName.split('/').pop()
      dropboxService.fetchFile(fileName)
        .then(vm.setFile)

    vm.close = ->
      $modalInstance.dismiss('cancel')

    vm.onPageChange()

    return
