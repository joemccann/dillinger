
'use strict'

module.exports =
  angular
  .module('plugins.dropbox', ['plugins.dropbox.service', 'plugins.dropbox.modal'])
  .controller 'Dropbox',
  ($rootScope, $modal, dropboxService, documentsService) ->

    vm = @

    importFile = ->
      console.log "importing!"

      modalInstance = $modal.open
        templateUrl: '../coffeescript/plugins/dropbox/dropbox-modal.directive.html'
        controller: 'DropboxModal as modal'
        resolve:
          items: ->
            dropboxService.fetchFiles()

      modalInstance.result.then ->
        console.log dropboxService.fetched
        documentsService.setCurrentDocumentTitle(dropboxService.fetched.fileName)
        documentsService.setCurrentDocumentBody(dropboxService.fetched.file)
        # dropboxService.save()
        $rootScope.$emit 'document.refresh'
        $rootScope.$emit 'autosave'
      , ->
        console.log "Modal dismissed at: #{new Date()}"

    saveTo = ->
      console.log "saveTo"

    vm.importFile = importFile
    vm.saveTo = saveTo

    return
