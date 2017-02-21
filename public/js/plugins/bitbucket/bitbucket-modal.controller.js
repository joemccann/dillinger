
'use strict';

module.exports =
  angular
  .module('plugins.bitbucket.modal', [
    'plugins.bitbucket.service'
  ])
  .controller('BitbucketModal', function($modalInstance, bitbucketService) {

  var vm = this;

  vm.title = 'Organizations';
  vm.orgs  = bitbucketService.config.orgs;
  vm.step  = 1;
  vm.lastStep = null;

  vm.fetchRepos     = fetchRepos;
  vm.fetchBranches  = fetchBranches;
  vm.fetchTreeFiles = fetchTreeFiles;
  vm.fetchFile      = fetchFile;
  vm.close          = closeModal;

  vm.itemsPerPage   = 10;
  vm.currentPage    = 1;
  vm.repos          = [];
  vm.org_name       = null;
  vm.branch_name   = null;

  //////////////////////////////

  function setFile() {
    return $modalInstance.close();
  }

  function closeModal() {
    return $modalInstance.dismiss('cancel');
  }

  function setRepos() {
    vm.step  = 2;
    vm.lastStep = vm.step;
    vm.title = 'Repositories';
    vm.pagination = bitbucketService.config.pagination;
     
      if (String(vm.pagination) == "null")
      {
        vm.totalItems = 1 * vm.itemsPerPage;
      }else{
        vm.totalItems = vm.pagination.last.page * vm.itemsPerPage;
      }
    
    vm.repos = bitbucketService.config.repos.sort(function(a, b) {
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      } else {
        return 0;
      }
    });

    return vm.repos;
  }

  function fetchRepos(name) {
    if (vm.lastStep !== 2) {
      vm.currentPage = 1;
    }
    if (name) {
      vm.org_name = name
    }
    bitbucketService.fetchRepos(
      vm.org_name, vm.currentPage, vm.itemsPerPage
    ).then(setRepos);

    return false;
  }

  function setBranches() {
    vm.step = 3;
    vm.lastStep = vm.step;
    vm.title = 'Branches';
    vm.branches = bitbucketService.config.branches;
    vm.pagination = bitbucketService.config.pagination;
     
      if (String(vm.pagination) == "null")
      {
        vm.totalItems = 1 * vm.itemsPerPage;
      }else{
        vm.totalItems = vm.pagination.last.page * vm.itemsPerPage;
      }
    
    vm.repos = bitbucketService.config.branches.sort(function(a, b) {
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      } else {
        return 0;
      }
    });

    return vm.branches;
  }

  function fetchBranches(name) {
    if (vm.lastStep !== 3) {
      vm.currentPage = 1;
    }
    if (name) {
      vm.branch_name = name
    }
    bitbucketService.config.current.branch = name;
    bitbucketService.fetchBranches(
      vm.branch_name, vm.org_name, vm.currentPage, vm.itemsPerPage
    ).then(setBranches);

    return false;
  }

  function setTreeFiles() {
    vm.step  = 4;
    vm.lastStep = vm.step;
    vm.title = 'Files';
    vm.files = bitbucketService.config.files;
    /* Set totalItems to 1 for now until it's determined that pagination is even required... in which case it must be handled differently because the
     * underlying Bitbucket API is 1.0 not 2.0 (not available) for file listing.
     */
    vm.totalItems = 1;

    return vm.files;
  }

  function fetchTreeFiles(sha, branch) {
    if (vm.lastStep !== 4) {
      vm.currentPage = 1;
    }
    bitbucketService.config.current.sha    = sha;
    bitbucketService.config.current.branch = branch;
    bitbucketService.fetchTreeFiles(sha).then(setTreeFiles);

    return false;
  }

  function fetchFile(url, path) {
    bitbucketService.config.current.fileName = path.split('/').pop();
    bitbucketService.config.current.path = path;
    bitbucketService.fetchFile(url).then(setFile);

    return false;
  }

  vm.onPageChange = function(step) {
    switch(step) {
      case 2: vm.fetchRepos(null); break;
      case 3: vm.fetchBranches(null); break;
    }
  }

});
