
'use strict'

Dillinger = require('../dillinger')

#
# Write your Controllers like this as ng-annotate does not follow references!
#

DocumentCtrl = Dillinger.controller 'DocumentsController',
  ($scope, $rootScope, DocService) ->

    # 1. Self-reference
    controller = @

    # 2. Requirements

    # 3. Scope Stuff

    # 3a. Set up watchers on the scope
    # $scope.$watch 'document.save', saveDocument
    # $scope.$watch 'document.create', createDocument
    # $scope.$watch 'document.remove', removeDocument
    # $scope.$watch 'document.select', selectDocument

    # 3b. Expose methods or data on the scope
    $scope.documents = DocService.getItems()

    save = ->
      console.log "DocumentsController.save"
      item = DocService.getCurrentDocument()
      item.body = $rootScope.editor.getSession().getValue()
      DocService.save()

    selectDocument = (item) ->
      console.log item
      console.log "DocumentsController.selectDocument"
      # console.log "item: #{JSON.stringify(item, null, '\t')}"
      item = DocService.getItem(item)
      DocService.setCurrentDocument(item)
      $rootScope.$emit 'document.refresh'

    removeDocument = (item) ->
      console.log "DocumentsController.removeDocument"
      # console.log "item: #{JSON.stringify(item, null, '\t')}"
      DocService.removeItem(item)
      next = DocService.getItemByIndex(0)
      DocService.setCurrentDocument(next)
      $rootScope.$emit 'document.refresh'

    createDocument = ->
      console.log "DocumentsController.createDocument"
      item = DocService.createItem()
      # console.log "item: #{JSON.stringify(item, null, '\t')}"
      DocService.addItem(item)
      DocService.setCurrentDocument(item)
      $rootScope.$emit 'document.refresh'

    # 3c. Listen to events on the scope

    # 4. Expose methods and properties on the controller instance

    # 5. Clean up
    $scope.$on '$destroy', ->
      console.log "$destroy"
      controller = null
      $scope     = null

    # 6. All the actual implementations go here.
    $scope.saveDocument   = save
    $scope.createDocument = createDocument
    $scope.removeDocument = removeDocument
    $scope.selectDocument = selectDocument

    return

module.exports = DocumentCtrl
