
'use strict'

module.exports =
  angular
  .module('plugins.onedrive', ['plugins.onedrive.service', 'plugins.onedrive.modal'])
  .controller 'Onedrive',
  ($rootScope, $modal, onedriveService, documentsService) ->

    vm = @

    importFile = ->

      modalInstance = $modal.open
        template: require('raw!./one-drive-modal.directive.html')
        controller: 'OnedriveModal as modal'
        windowClass: 'modal--dillinger'
        resolve:
          items: ->
            onedriveService.fetchFiles()

      modalInstance.result.then ->
        documentsService.setCurrentDocumentTitle(onedriveService.fetched.fileName)
        documentsService.setCurrentDocumentBody(onedriveService.fetched.file)
        # onedriveService.save()
        $rootScope.$emit 'document.refresh'
        $rootScope.$emit 'autosave'
      , ->
        console.log "Modal dismissed at: #{new Date()}"

    saveTo = ->
      console.log "saveTo"

    vm.importFile = importFile
    vm.saveTo = saveTo

    return
