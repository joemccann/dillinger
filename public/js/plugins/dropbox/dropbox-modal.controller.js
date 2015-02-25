
'use strict';

/**
 *    Dropbox Modal Controller.
 */

module.exports =
  angular
  .module('plugins.dropbox.modal', [
    'plugins.dropbox.service'
  ])
  .filter('startFrom', function() {
    return function(input, start) {
      if (input) {
        start = +start;
        return input.slice(start);
      }
    };
  })
  .controller('DropboxModal', function($scope, $modalInstance, dropboxService, filterFilter) {

  var vm = this;

  vm.title          = 'Dropbox';
  vm.allFiles       = dropboxService.files;
  vm.allFilesLength = dropboxService.files.length;
  vm.paginatedFiles = [];
  vm.currentPage    = 1;
  vm.itemsPerPage   = 16;
  vm.maxSize        = 5;
  vm.query          = undefined;

  vm.onPageChange       = onPageChange;
  vm.assignFileOnEditor = assignFileOnEditor;
  vm.fetchFile          = fetchFile;
  vm.close              = closeModal;

  // Init the paginatedFiles Array.
  vm.onPageChange();

  //////////////////////////////

  function onPageChange() {
    vm.paginatedFiles = filterFilter(vm.allFiles, vm.query);

    return vm.paginatedFiles;
  }

  function assignFileOnEditor() {
    return $modalInstance.close();
  }

  function fetchFile(fileName) {
    // Remove path to document, leaving only the name of the file.
    dropboxService.fetched.fileName = fileName.split('/').pop();

    return dropboxService.fetchFile(fileName).then(vm.assignFileOnEditor);
  }

  function closeModal() {
    return $modalInstance.dismiss('cancel');
  }

});
