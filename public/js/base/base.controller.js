
'use strict'

var ace = require('brace')
var bodyScrollLock = require('body-scroll-lock');
require('brace/keybinding/vim')
require('brace/keybinding/emacs')
require('brace/mode/markdown')
require('../documents/theme-dillinger')

module.exports =
  angular
    .module('diBase', [
      'diBase.controllers.about',
      'diBase.directives.switch',
      'diBase.directives.documentTitle',
      'diBase.directives.menuToggle',
      'diBase.directives.settingsToggle',
      'diBase.directives.previewToggle',
      'diBase.directives.preview'
    ])
    .controller('Base', function ($scope, $rootScope, userService, documentsService) {
      $scope.profile = userService.profile
      $rootScope.currentDocument = documentsService.getCurrentDocument()
      $rootScope.editor = ace.edit('editor')
      $rootScope.viewSrcMode = false
      $rootScope.editor.getSession().setMode('ace/mode/markdown')
      $rootScope.editor.setTheme('ace/theme/dillinger')
      $rootScope.editor.getSession().setUseWrapMode(true)
      $rootScope.editor.setShowPrintMargin(false)
      $rootScope.editor.getSession().setValue($rootScope.currentDocument.body)
      $rootScope.editor.setOption('minLines', 50)
      $rootScope.editor.setOption('maxLines', 90000)
      $rootScope.editor.session.$selectLongWords = true

      var updateDocument = function () {
        $rootScope.currentDocument = documentsService.getCurrentDocument()
        return $rootScope.editor.getSession().setValue($rootScope.currentDocument.body)
      }

      $scope.updateDocument = updateDocument

      $scope.toggleView = function () {
        $rootScope.viewSrcMode = !$rootScope.viewSrcMode
      }

      $rootScope.$on('document.refresh', updateDocument)

      var editorElement = document.getElementById("editor1")
      var previewElement = document.getElementById("preview1")
      var sidebarElement = document.getElementsByClassName("sidebar")[0]
      bodyScrollLock.disableBodyScroll(editorElement);
      bodyScrollLock.disableBodyScroll(previewElement);
      bodyScrollLock.disableBodyScroll(sidebarElement);

      var setEditorHeight = function() {
        editorElement.style.setProperty("height", window.innerHeight - 172 + "px")
        previewElement.style.setProperty("height", window.innerHeight - 172 + "px")
      }
      window.addEventListener("resize", setEditorHeight)
      setEditorHeight()
    })
