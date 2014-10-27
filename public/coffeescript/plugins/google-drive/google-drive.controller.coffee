
'use strict'

module.exports =
  angular
  .module('plugins.googledrive', ['plugins.googledrive.service', 'plugins.googledrive.modal'])
  .controller 'Googledrive',
  ($rootScope, $modal, googledriveService, documentsService) ->

    vm = @

    importFile = ->

      modalInstance = $modal.open
        template: require('raw!./google-drive-modal.directive.html')
        controller: 'GoogledriveModal as modal'
        windowClass: 'modal--dillinger'
        resolve:
          items: ->
            googledriveService.fetchFiles()

      modalInstance.result.then ->
        documentsService.setCurrentDocumentTitle(googledriveService.fetched.fileName)
        documentsService.setCurrentDocumentBody(googledriveService.fetched.file)
        # googledriveService.save()
        $rootScope.$emit 'document.refresh'
        $rootScope.$emit 'autosave'
      , ->
        console.log "Modal dismissed at: #{new Date()}"

    saveTo = ->
      title = documentsService.getCurrentDocumentTitle()
      body = documentsService.getCurrentDocumentBody()
      googledriveService.saveFile(title, body)

    vm.importFile = importFile
    vm.saveTo = saveTo

    return
