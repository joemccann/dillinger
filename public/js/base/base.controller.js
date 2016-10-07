
'use strict';

var ace = require('brace');

require('brace/mode/markdown');
require('../documents/theme-dillinger');

module.exports =
  angular
  .module('diBase', [
    'diBase.controllers.about',
    'diBase.directives.switch',
    'diBase.directives.documentTitle',
    'diBase.directives.githubCommitMessage',
    'diBase.directives.menuToggle',
    'diBase.directives.settingsToggle',
    'diBase.directives.previewToggle',
    'diBase.directives.preview'
  ])
  .controller('Base', function($scope, $rootScope, userService, documentsService) {

  $scope.profile             = userService.profile;
  $rootScope.currentDocument = documentsService.getCurrentDocument();
  $rootScope.editor          = ace.edit('editor');

  $rootScope.editor.getSession().setMode('ace/mode/markdown');
  $rootScope.editor.setTheme('ace/theme/dillinger');
  $rootScope.editor.getSession().setUseWrapMode(true);
  $rootScope.editor.setShowPrintMargin(false);
  $rootScope.editor.getSession().setValue($rootScope.currentDocument.body);
  $rootScope.editor.setOption('minLines', 50);
  $rootScope.editor.setOption('maxLines', 90000);

  var updateDocument = function() {
    $rootScope.currentDocument = documentsService.getCurrentDocument();
    return $rootScope.editor.getSession().setValue($rootScope.currentDocument.body);
  };

  $scope.updateDocument = updateDocument;

  $rootScope.$on('document.refresh', updateDocument);
});
