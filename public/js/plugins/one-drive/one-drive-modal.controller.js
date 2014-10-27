
'use strict';
module.exports = angular.module('plugins.onedrive.modal', ['plugins.onedrive.service']).filter('startFrom', function() {
  return function(input, start) {
    if (input) {
      start = +start;
      return input.slice(start);
    }
  };
}).controller('OnedriveModal', function($scope, $modalInstance, onedriveService, filterFilter) {
  var vm;
  vm = this;
  vm.title = "One Drive";
  vm.allFiles = onedriveService.files;
  vm.allFilesLength = onedriveService.files.length;
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
  vm.fetchFile = function(fileId, fileName) {
    onedriveService.fetched.fileName = fileName.split('/').pop();
    return onedriveService.fetchFile(fileId).then(vm.setFile);
  };
  vm.close = function() {
    return $modalInstance.dismiss('cancel');
  };
  vm.onPageChange();
});
