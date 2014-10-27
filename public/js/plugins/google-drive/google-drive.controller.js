
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
    return googledriveService.saveFile(title, body);
  };
  vm.importFile = importFile;
  vm.saveTo = saveTo;
});
