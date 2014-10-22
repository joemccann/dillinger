
'use strict'

app         = require('../dillinger')
ace         = require('brace')
# keymaster = require('keymaster')
# Switchery = require('switchery-browserify')
# highlight = require('highlight.js')

require 'brace/mode/markdown'
require 'brace/theme/solarized_dark'
# require 'brace/theme/solarized_light'

module.exports = app.controller 'Base',
  ($scope, $rootScope, userService, documentsService) ->

    $scope.profile         = userService.profile
    $scope.currentDocument = documentsService.getCurrentDocument()
    $rootScope.editor      = ace.edit 'editor'

    $rootScope.editor.getSession().setMode('ace/mode/markdown')
    $rootScope.editor.setTheme('ace/theme/solarized_dark')
    $rootScope.editor.getSession().setUseWrapMode(true)
    $rootScope.editor.setShowPrintMargin(false)
    $rootScope.editor.getSession().setValue($scope.currentDocument.body)
    $rootScope.editor.setOption('maxLines', 90000)

    window.editor = $rootScope.editor

    updateDocument = ->
      $scope.currentDocument = documentsService.getCurrentDocument()
      $rootScope.editor.getSession().setValue($scope.currentDocument.body)

    $scope.updateDocument = updateDocument

    $rootScope.$on 'document.refresh', updateDocument

    return
