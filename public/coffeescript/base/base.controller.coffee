
'use strict'

app         = require('../dillinger')
ace         = require('brace')
# keymaster = require('keymaster')
# highlight = require('highlight.js')

require 'brace/mode/markdown'
require 'brace/theme/solarized_dark'
# require 'brace/theme/solarized_light'

module.exports = app.controller 'Base',
  ($scope, $rootScope, userService, documentsService) ->

    $scope.profile             = userService.profile
    $rootScope.currentDocument = documentsService.getCurrentDocument()
    $rootScope.editor          = ace.edit 'editor'

    $rootScope.editor.getSession().setMode('ace/mode/markdown')
    $rootScope.editor.setTheme('ace/theme/solarized_dark')
    $rootScope.editor.getSession().setUseWrapMode(true)
    $rootScope.editor.setShowPrintMargin(false)
    $rootScope.editor.getSession().setValue($rootScope.currentDocument.body)
    $rootScope.editor.setOption('maxLines', 90000)

    updateDocument = ->
      $rootScope.currentDocument = documentsService.getCurrentDocument()
      # console.log documentsService.getItem($rootScope.currentDocument)
      $rootScope.editor.getSession().setValue($rootScope.currentDocument.body)

    $scope.updateDocument = updateDocument

    $rootScope.$on 'document.refresh', updateDocument

    return
