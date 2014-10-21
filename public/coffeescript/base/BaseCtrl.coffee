
Dillinger   = require('../dillinger')
ace         = require('brace')
# keymaster = require('keymaster')
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

    updateDocument = ->
      console.log "BaseController.updateDocument"
      $scope.currentDocument = DocService.getCurrentDocument()
      $rootScope.editor.getSession().setValue($scope.currentDocument.body)
      $scope.$emit 'wordcount.refresh'

    $scope.updateDocument = updateDocument

    $rootScope.$on 'document.refresh', updateDocument

    return

module.exports = BaseCtrl