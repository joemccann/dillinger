
'use strict'

module.exports =
  angular
  .module('plugins.dropbox', ['plugins.dropbox.service', 'plugins.dropbox.modal'])
  .controller 'Dropbox',
  ($rootScope, $modal, dropboxService, documentsService) ->

    vm = @

    importFile = ->

      modalInstance = $modal.open
        template: require('raw!./dropbox-modal.directive.html')
        controller: 'DropboxModal as modal'
        windowClass: 'modal--dillinger'
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
      title = documentsService.getCurrentDocumentTitle()
      body = documentsService.getCurrentDocumentBody()
      dropboxService.saveFile(title, body)

    vm.importFile = importFile
    vm.saveTo = saveTo

    return
