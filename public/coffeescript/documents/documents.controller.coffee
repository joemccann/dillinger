
'use strict'

module.exports =
  angular
  .module('documents', ['documents.service', 'documents.export'])
  .controller 'Documents',
  ($scope, $timeout, $rootScope, userService, documentsService) ->

    # 1. Self-reference
    vm = @

    # 2. Requirements

    # 3. Scope Stuff
    $scope.profile = userService.profile

    # 3a. Set up watchers on the scope

    # 3b. Expose methods or data on the scope
    $rootScope.documents = documentsService.getItems()

    # Bootstrap Dropdown...
    $scope.status =
      isopen: true

    save = ->
      # console.log "DocumentsController.save"
      item = documentsService.getCurrentDocument()
      item.body = $rootScope.editor.getSession().getValue()
      documentsService.setCurrentDocument(item)
      documentsService.save()

    initDocument = ->
      item = documentsService.getItemById($rootScope.currentDocument.id)
      documentsService.setCurrentDocument(item)
      $rootScope.$emit 'document.refresh'

    selectDocument = (item) ->
      #    console.log "DocumentsController.selectDocument"
      item = documentsService.getItem(item)
      documentsService.setCurrentDocument(item)
      $rootScope.$emit 'document.refresh'

    removeDocument = (item) ->
      # console.log "DocumentsController.removeDocument"
      documentsService.removeItem(item)
      next = documentsService.getItemByIndex(0)
      documentsService.setCurrentDocument(next)
      $rootScope.$emit 'document.refresh'

    createDocument = ->
      # console.log "DocumentsController.createDocument"
      item = documentsService.createItem()
      documentsService.addItem(item)
      documentsService.setCurrentDocument(item)
      $rootScope.$emit 'document.refresh'

    doAutoSave = ->
      if $scope.profile.enableAutoSave
        save()

    # 3c. Listen to events on the scope

    # 4. Expose methods and properties on the controller instance

    # 5. Clean up
    $scope.$on '$destroy', ->
      console.log "$destroy"
      vm     = null
      $scope = null

    # 6. All the actual implementations go here.
    $scope.saveDocument   = save
    $scope.createDocument = createDocument
    $scope.removeDocument = removeDocument
    $scope.selectDocument = selectDocument

    $rootScope.editor.on 'change', doAutoSave

    $rootScope.$on 'autosave', doAutoSave
    initDocument()

    return
