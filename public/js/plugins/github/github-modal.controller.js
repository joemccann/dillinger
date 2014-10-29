
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
    vm.repos = githubService.config.repos;

    return vm.repos;
  }

  function fetchRepos(name) {
    githubService.fetchRepos(name).then(setRepos);

    return false;
  }

  function fetchFile(url, name) {
    githubService.config.current.fileName = name.split('/').pop();
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

  function fetchTreeFiles(sha) {
    githubService.config.current.sha = sha;
    githubService.fetchTreeFiles(sha).then(setTreeFiles);

    return false;
  }

});
