
'use strict';
module.exports = angular.module('plugins.dropbox.modal', ['plugins.dropbox.service']).filter('startFrom', function() {
  return function(input, start) {
    if (input) {
      start = +start;
      return input.slice(start);
    }
  };
}).controller('DropboxModal', function($scope, $modalInstance, dropboxService, filterFilter) {
  var vm;
  vm = this;
  vm.title = "Dropbox";
  vm.allFiles = dropboxService.files;
  vm.allFilesLength = dropboxService.files.length;
  vm.paginatedFiles = [];
  vm.currentPage = 1;
  vm.itemsPerPage = 16;
  vm.maxSize = 5;
  vm.query = void 0;
  vm.onPageChange = function() {
    return vm.paginatedFiles = filterFilter(vm.allFiles, vm.query);
  };
  vm.setFile = function() {
    return $modalInstance.close();
  };
  vm.fetchFile = function(fileName) {
    dropboxService.fetched.fileName = fileName.split('/').pop();
    return dropboxService.fetchFile(fileName).then(vm.setFile);
  };
  vm.close = function() {
    return $modalInstance.dismiss('cancel');
  };
  vm.onPageChange();
});
