
'use strict';

module.exports =
  angular
  .module('plugins.medium.modal', [
    'plugins.medium.service'
  ])
  .controller('MediumModal', function($modalInstance, mediumService) {

  var vm = this;


  //////////////////////////////

  function setFile() {
    return $modalInstance.close();
  }

  function closeModal() {
    return $modalInstance.dismiss('cancel');
  }

  vm.onPageChange = function() {
    vm.fetchRepos(null, vm.currentPage);
  }

});
