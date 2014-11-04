
'use strict';

/**
 *    Dropbox Controller.
 */

module.exports =
  angular
  .module('plugins.dropbox', [
    'plugins.dropbox.service',
    'plugins.dropbox.modal'
  ])
  .controller('Dropbox', function($rootScope, $modal, dropboxService, documentsService) {


  // I.
  // Self-reference
  var vm = this;

  // II.
  // Requirements

  // III.
  // Scope Stuff

  // III. a)
  // Watchers

  // III. b)
  // Scope Methods

  // III. c)
  // Listen to Events

  // IV.
  // Methods on the Controller
  vm.importFile = importFile;
  vm.saveTo     = saveTo;

  // IV. a)
  // Properties on the Controller

  // V.
  // Cleanup

  // VI.
  // Implementation
  // ------------------------------

  /**
   *    Opens the Bootstrap Modal and returns a Promise which will then
   *    update the current document.
   */
  function importFile() {
    var modalInstance = $modal.open({
      template:    require('raw!./dropbox-modal.directive.html'),
      controller:  'DropboxModal as modal',
      windowClass: 'modal--dillinger',
      resolve: {
        items: function() {
          return dropboxService.fetchFiles();
        }
      }
    });

    return modalInstance.result.then(function() {

      documentsService.setCurrentDocumentTitle(dropboxService.fetched.fileName);
      documentsService.setCurrentDocumentBody(dropboxService.fetched.file);

      // tell other services
      $rootScope.$emit('document.refresh');
      $rootScope.$emit('autosave');

      return false;
    });
  }

  /**
   *    Saves the File on Dropbox.
   */
  function saveTo() {
    var body, title;

    title  = documentsService.getCurrentDocumentTitle();
    body   = documentsService.getCurrentDocumentBody();
    
    return dropboxService.saveFile(title, body);
  }

});
