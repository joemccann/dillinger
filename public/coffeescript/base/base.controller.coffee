
'use strict'

app         = require('../dillinger')
ace         = require('brace')
# keymaster = require('keymaster')

require 'brace/mode/markdown'
require '../documents/theme-dillinger'

module.exports = app.controller 'Base',
  ($scope, $timeout, $rootScope, userService, documentsService, notificationService) ->

    $scope.profile             = userService.profile
    $rootScope.currentDocument = documentsService.getCurrentDocument()
    $rootScope.editor          = ace.edit 'editor'

    $rootScope.editor.getSession().setMode('ace/mode/markdown')
    $rootScope.editor.setTheme('ace/theme/dillinger')
    $rootScope.editor.getSession().setUseWrapMode(true)
    $rootScope.editor.setShowPrintMargin(false)
    $rootScope.editor.getSession().setValue($rootScope.currentDocument.body)
    $rootScope.editor.setOption('minLines', 37)
    $rootScope.editor.setOption('maxLines', 90000)

    $timeout ->
      notificationService('looola!')
      $timeout ->
        notificationService('looola!')
      , 999
    , 999

    updateDocument = ->
      $rootScope.currentDocument = documentsService.getCurrentDocument()
      # console.log documentsService.getItem($rootScope.currentDocument)
      $rootScope.editor.getSession().setValue($rootScope.currentDocument.body)

    $scope.updateDocument = updateDocument

    $rootScope.$on 'document.refresh', updateDocument

    return
