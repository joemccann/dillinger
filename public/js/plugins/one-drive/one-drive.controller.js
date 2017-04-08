
'use strict';
module.exports = angular.module('plugins.onedrive', ['plugins.onedrive.service', 'plugins.onedrive.modal']).controller('Onedrive', function($rootScope, $modal, onedriveService, documentsService) {
  var importFile, saveTo, vm;
  vm = this;
  importFile = function() {
    var modalInstance;
    modalInstance = $modal.open({
      template: require('raw!./one-drive-modal.directive.html'),
      controller: 'OnedriveModal as modal',
      windowClass: 'modal--dillinger',
      resolve: {
        items: function() {
          return onedriveService.fetchFiles();
        }
      }
    });
    return modalInstance.result.then(function successCallback() {
      documentsService.setCurrentDocumentTitle(onedriveService.fetched.fileName);
      documentsService.setCurrentDocumentBody(onedriveService.fetched.file);
      $rootScope.$emit('document.refresh');
      return $rootScope.$emit('autosave');
    }, function errorCallback() {
      return console.log("Modal dismissed at: " + (new Date()));
    });
  };
  saveTo = function() {
    var body, title;
    title = documentsService.getCurrentDocumentTitle();
    body = documentsService.getCurrentDocumentBody();
    return onedriveService.saveFile(title, body);
  };
  vm.importFile = importFile;
  vm.saveTo = saveTo;
});
