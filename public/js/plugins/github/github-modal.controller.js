
'use strict';
module.exports = angular.module('plugins.github.modal', ['plugins.github.service']).controller('GithubModal', function($modalInstance, githubService) {
  var close, fetchBranches, fetchFile, fetchRepos, fetchTreeFiles, setBranches, setFile, setRepos, setTreeFiles, vm;
  vm = this;
  vm.title = "Organizations";
  vm.orgs = githubService.config.orgs;
  vm.step = 1;
  setFile = function() {
    return $modalInstance.close();
  };
  close = function() {
    return $modalInstance.dismiss('cancel');
  };
  setRepos = function() {
    vm.title = "Repositories";
    vm.step = 2;
    return vm.repos = githubService.config.repos;
  };
  fetchRepos = function(name) {
    githubService.fetchRepos(name).then(setRepos);
    return false;
  };
  fetchFile = function(url, name) {
    githubService.config.current.fileName = name.split('/').pop();
    githubService.fetchFile(url).then(setFile);
    return false;
  };
  setBranches = function() {
    vm.title = "Branches";
    vm.step = 3;
    return vm.branches = githubService.config.branches;
  };
  fetchBranches = function(name) {
    githubService.config.current.repo = name;
    githubService.fetchBranches(name).then(setBranches);
    return false;
  };
  setTreeFiles = function() {
    vm.title = "Files";
    vm.step = 4;
    return vm.files = githubService.config.current.tree;
  };
  fetchTreeFiles = function(sha) {
    githubService.config.current.sha = sha;
    githubService.fetchTreeFiles(sha).then(setTreeFiles);
    return false;
  };
  vm.fetchRepos = fetchRepos;
  vm.fetchBranches = fetchBranches;
  vm.fetchTreeFiles = fetchTreeFiles;
  vm.fetchFile = fetchFile;
  vm.close = close;
});
