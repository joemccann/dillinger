const ace = require('brace')
const bodyScrollLock = require('body-scroll-lock')
require('brace/keybinding/vim')
require('brace/keybinding/emacs')
require('brace/mode/markdown')
require('brace/theme/github')

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
    .controller('Base', ($scope, $rootScope, userService, documentsService, adsService) => {
      $scope.profile = userService.profile
      $rootScope.currentDocument = documentsService.getCurrentDocument()
      $rootScope.editor = ace.edit('editor')
      $rootScope.viewSrcMode = false
      $rootScope.editor.getSession().setMode('ace/mode/markdown')
      $rootScope.editor.setTheme('ace/theme/github')
      $rootScope.editor.getSession().setUseWrapMode(true)
      $rootScope.editor.setShowPrintMargin(false)
      $rootScope.editor.getSession().setValue($rootScope.currentDocument.body)
      $rootScope.editor.setOption('minLines', 50)
      $rootScope.editor.setOption('maxLines', 90000)
      $rootScope.editor.session.$selectLongWords = true

      const updateDocument = function () {
        $rootScope.currentDocument = documentsService.getCurrentDocument()
        return $rootScope
          .editor
          .getSession()
          .setValue($rootScope.currentDocument.body)
      }

      $scope.updateDocument = updateDocument

      $scope.toggleView = function () {
        $rootScope.viewSrcMode = !$rootScope.viewSrcMode
      }

      $rootScope.$on('document.refresh', updateDocument)

      const editorElement = document.getElementById('editor1')
      const previewElement = document.getElementById('preview1')
      const sidebarElement = document.getElementsByClassName('sidebar')[0]

      bodyScrollLock.disableBodyScroll(editorElement)
      bodyScrollLock.disableBodyScroll(previewElement)
      bodyScrollLock.disableBodyScroll(sidebarElement)

      const setEditorHeight = function () {
        editorElement.style
          .setProperty('height', window.innerHeight - 172 + 'px')
        previewElement.style
          .setProperty('height', window.innerHeight - 172 + 'px')
      }
      window.addEventListener('resize', setEditorHeight)
      setEditorHeight()

      // Handle ads
      if (process.env.NODE_ENV === 'production') {
        adsService.loadAds()
          .then(function(data) {
            // Ad loaded successfully
            console.log('Ads loaded:', data);
          })
          .catch(function(err) {
            // Error already handled in service
            console.log('Failed to load ads:', err);
          });
      } else {
        // Hide ads in development
        adsService.hideAds();
      }
    })
