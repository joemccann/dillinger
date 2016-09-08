
'use strict';

module.exports =
  angular
  .module('plugins.github.modal', [
    'plugins.github.service'
  ])
  .controller('GithubModal', function($modalInstance, githubService) {

  var vm = this;

  vm.title = 'Organizations';
  vm.orgs  = githubService.config.orgs;
  vm.step  = 1;

  vm.fetchRepos     = fetchRepos;
  vm.fetchBranches  = fetchBranches;
  vm.fetchTreeFiles = fetchTreeFiles;
  vm.fetchFile      = fetchFile;
  vm.close          = closeModal;

  vm.itemsPerPage   = 10;
  vm.currentPage    = 1;
  vm.repos          = [];
  vm.org_name       = null;

  //////////////////////////////

  function setFile() {
    return $modalInstance.close();
  }

  function closeModal() {
    return $modalInstance.dismiss('cancel');
  }

  function setRepos() {
    vm.title = 'Repositories';
    vm.step  = 2;
    vm.pagination = githubService.config.pagination;
     
    if (!vm.totalItems) {
      //#pagination BUG - @graredcr - 25/09/2016
      if (String(vm.pagination) == "null")
      {
        vm.totalItems = 1 * vm.itemsPerPage;
      }else{
        vm.totalItems = vm.pagination.last.page * vm.itemsPerPage;
      }
    }
    vm.repos = githubService.config.repos.sort(function(a, b) {
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
    if (name) {
      vm.org_name = name
    }

    githubService.fetchRepos(
      vm.org_name, vm.currentPage, vm.itemsPerPage
    ).then(setRepos);

    return false;
  }

  function fetchFile(url, path) {
    githubService.config.current.fileName = path.split('/').pop();
    githubService.config.current.path = path;
    githubService.fetchFile(url).then(setFile);

    return false;
  }

  function setBranches() {
    vm.title = 'Branches';
    vm.step = 3;
    vm.branches = githubService.config.branches;

    return vm.branches;
  }

  function fetchBranches(name) {
    githubService.config.current.repo = name;
    githubService.fetchBranches(name).then(setBranches);

    return false;
  }

  function setTreeFiles() {
    vm.title = 'Files';
    vm.step  = 4;
    vm.files = githubService.config.current.tree;

    return vm.files;
  }

  function fetchTreeFiles(sha, branch) {
    githubService.config.current.sha    = sha;
    githubService.config.current.branch = branch;
    githubService.fetchTreeFiles(sha).then(setTreeFiles);

    return false;
  }

  vm.onPageChange = function() {
    vm.fetchRepos(null, vm.currentPage);
  }

});
