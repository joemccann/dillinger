
'use strict';
module.exports = angular.module('plugins.googledrive', ['plugins.googledrive.service', 'plugins.googledrive.modal']).controller('Googledrive', function($rootScope, $modal, googledriveService, documentsService) {
  var importFile, saveTo, vm;
  vm = this;
  importFile = function() {
    var modalInstance;
    modalInstance = $modal.open({
      template: require('raw!./google-drive-modal.directive.html'),
      controller: 'GoogledriveModal as modal',
      windowClass: 'modal--dillinger',
      resolve: {
        items: function() {
          return googledriveService.fetchFiles();
        }
      }
    });
    return modalInstance.result.then(function() {
      documentsService.setCurrentDocumentTitle(googledriveService.fetched.fileName);
      documentsService.setCurrentDocumentBody(googledriveService.fetched.file);
      documentsService.setCurrentDocumentId(googledriveService.fetched.fileId);
      $rootScope.$emit('document.refresh');
      return $rootScope.$emit('autosave');
    }, function() {
      return console.log("Modal dismissed at: " + (new Date()));
    });
  };
  saveTo = function() {
    var body, title, fileId, data;
    data = documentsService.getCurrentDocument();
    title = data.title;
    body = data.body
    fileId = data.fileId;
    googledriveService.saveFile(title, body, fileId, function(id) {
      // persist id of document in case document was not imported
      return documentsService.setCurrentDocumentId(id);
    });
  };
  vm.importFile = importFile;
  vm.saveTo = saveTo;
});
