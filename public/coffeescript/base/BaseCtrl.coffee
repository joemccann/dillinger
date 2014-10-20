
Dillinger   = require('../dillinger')
ace         = require('brace')
# keymaster = require('keymaster')
marked      = require('marked')
# Switchery = require('switchery-browserify')
# highlight = require('highlight.js')

require 'brace/mode/markdown'
require 'brace/theme/solarized_dark'
# require 'brace/theme/solarized_light'

#
# Write your Controllers like this as ng-annotate does not follow references!
#

BaseCtrl = Dillinger.controller 'BaseController',
  ($scope, $rootScope, UserService, DocService) ->

    'use strict'

    $scope.user            = UserService.user
    $scope.currentDocument = DocService.getCurrentDocument()

    $rootScope.editor = ace.edit 'editor'
    $rootScope.editor.getSession().setMode('ace/mode/markdown')
    $rootScope.editor.setTheme('ace/theme/solarized_dark')
    $rootScope.editor.getSession().setUseWrapMode(true)
    $rootScope.editor.setShowPrintMargin(false)
    $rootScope.editor.getSession().setValue($scope.currentDocument.body)

    refreshDocument = ->
      console.log "BaseController.refreshDocument"
      $scope.currentDocument = DocService.getCurrentDocument()
      $rootScope.editor.getSession().setValue($scope.currentDocument.body)

    $scope.updateDocument = ->
      console.log "BaseController.updateDocument"
      refreshDocument()

    $rootScope.$on 'document.refresh', refreshDocument

    return

module.exports = BaseCtrl
