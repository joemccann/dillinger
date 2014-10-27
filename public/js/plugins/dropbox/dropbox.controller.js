
'use strict';
module.exports = angular.module('plugins.dropbox', ['plugins.dropbox.service', 'plugins.dropbox.modal']).controller('Dropbox', function($rootScope, $modal, dropboxService, documentsService) {
  var importFile, saveTo, vm;
  vm = this;
  importFile = function() {
    var modalInstance;
    modalInstance = $modal.open({
      template: require('raw!./dropbox-modal.directive.html'),
      controller: 'DropboxModal as modal',
      windowClass: 'modal--dillinger',
      resolve: {
        items: function() {
          return dropboxService.fetchFiles();
        }
      }
    });
    return modalInstance.result.then(function() {
      console.log(dropboxService.fetched);
      documentsService.setCurrentDocumentTitle(dropboxService.fetched.fileName);
      documentsService.setCurrentDocumentBody(dropboxService.fetched.file);
      $rootScope.$emit('document.refresh');
      return $rootScope.$emit('autosave');
    }, function() {
      return console.log("Modal dismissed at: " + (new Date()));
    });
  };
  saveTo = function() {
    var body, title;
    title = documentsService.getCurrentDocumentTitle();
    body = documentsService.getCurrentDocumentBody();
    return dropboxService.saveFile(title, body);
  };
  vm.importFile = importFile;
  vm.saveTo = saveTo;
});
