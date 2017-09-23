
'use strict';

(function(window, document) {

  var angular;

  // jQuery
  window.jQuery = require('jquery'),
  require('jquery-ui-bundle/jquery-ui.js'),
  require('inverseresize/alsoResizeReverse/alsoResizeInverse'); 

  // AngularJS
  angular = require('exports?angular!angular');

  // Angular Bootstrap UI
  require('angular-bootstrap');

  // Base
  require('./base/base.controller');
  require('./components/document-title.directive');
  require('./components/toggle-menu.directive');
  require('./components/toggle-settings.directive');
  require('./components/toggle-preview.directive');
  require('./components/switch.directive');
  require('./components/preview.directive');
  require('./components/focus.factory');

  require('./components/wtfisdillinger-modal.controller');
  require('./services/debounce.service');

  // User
  require('./user/user.controller');
  require('./services/user.service');

  // Documents
  require('./factorys/sheet.factory');
  require('./services/documents.service');
  require('./documents/documents-export.controller');
  require('./documents/documents.controller');
  require('./documents/delete-modal.controller');
  require('./services/wordscount.service');
  require('./services/characterscount.service');

  // Plugin: Bitbucket
  require('./plugins/bitbucket/bitbucket.service');
  require('./plugins/bitbucket/bitbucket-modal.controller');
  require('./plugins/bitbucket/bitbucket.controller');

  // Plugin: Github
  require('./plugins/github/github.service');
  require('./plugins/github/github-modal.controller');
  require('./plugins/github/github.controller');

  // Plugin: Dropbox
  require('./plugins/dropbox/dropbox.service');
  require('./plugins/dropbox/dropbox-modal.controller');
  require('./plugins/dropbox/dropbox.controller');

  // Plugin: Google Drive
  require('./plugins/google-drive/google-drive.service');
  require('./plugins/google-drive/google-drive-modal.controller');
  require('./plugins/google-drive/google-drive.controller');

  // Plugin: Medium
  require('./plugins/medium/medium.service');
  require('./plugins/medium/medium-modal.controller');
  require('./plugins/medium/medium.controller');

  // Plugin: One Drive
  require('./plugins/one-drive/one-drive.service');
  require('./plugins/one-drive/one-drive-modal.controller');
  require('./plugins/one-drive/one-drive.controller');

  // Notifications
  require('./services/notification.service');

  // Zen Mode
  require('./zen-mode/zen-mode.controller');
  require('./zen-mode/zen-mode-toggle.directive');

  // File import.
  require('./file-import/drop-target.directive');
  require('./file-import/choose-file.directive');
  require('./file-import/import-file.controller');

  // Configure Dependencies
  angular.module('Dillinger', [
    'diBase',
    'diDocuments',
    'diNotify',
    'diUser',
    'diZenMode',
    'diFileImport',
    'plugins.bitbucket',
    'plugins.github',
    'plugins.dropbox',
    'plugins.medium',
    'plugins.googledrive',
    'plugins.onedrive',
    'ui.bootstrap',
    'diDebounce.service'
  ]);

  // Run!
  angular.bootstrap(document, ['Dillinger']);

  // Simple and works.
  return jQuery(window).on('load', function() {
    return jQuery('.splashscreen').animate({
      opacity: 0
    }, 150, function() {
      return jQuery('.splashscreen').remove()
    });
  });

})(window, document);
