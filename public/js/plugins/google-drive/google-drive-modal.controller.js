
'use strict';
module.exports = angular.module('plugins.googledrive.modal', ['plugins.googledrive.service']).filter('startFrom', function() {
  return function(input, start) {
    if (input) {
      start = +start;
      return input.slice(start);
    }
  };
}).controller('GoogledriveModal', function($scope, $modalInstance, googledriveService, filterFilter) {
  var vm;
  vm = this;
  vm.title = "Google Drive";
  vm.allFiles = googledriveService.files;
  vm.allFilesLength = googledriveService.files.length;
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
    googledriveService.fetched.fileName = fileName.split('/').pop();
    return googledriveService.fetchFile(fileName).then(vm.setFile);
  };
  vm.close = function() {
    return $modalInstance.dismiss('cancel');
  };
  vm.onPageChange();
});
