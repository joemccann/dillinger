'use strict';
module.exports =
  angular
  .module('plugins.github.modal', ['plugins.github.service'])
  .controller('GithubModal',
    function($modalInstance, githubService) {

      var vm;

      vm = this;

      vm.title = "Organizations";
      vm.orgs  = githubService.config.orgs;
      vm.step  = 1;

      vm.fetchRepos     = fetchRepos;
      vm.fetchBranches  = fetchBranches;
      vm.fetchTreeFiles = fetchTreeFiles;
      vm.fetchFile      = fetchFile;
      vm.close          = close;


      /**
       * Closes the modal and sets the file and filename on the editor.
       */
      function setFile() {
        return $modalInstance.close();
      };

      /**
       * Dismiss the modal
       */
      function close() {
        return $modalInstance.dismiss('cancel');
      };


      /**
       * fetchFile - fetch the selected file
       * @param  {string} url  url to the file
       * @param  {string} name name of the file
       * @return {bool}
       */
      function fetchFile(url, name) {
        githubService.config.current.fileName = name.split('/').pop();
        githubService.fetchFile(url).then(setFile);
        return false;
      };


      /**
       * Step: Select Repo
       */
      function setRepos() {
        vm.title = "Repositories";
        vm.step = 2;
        return vm.repos = githubService.config.repos;
      };


      /**
       * fetchRepos - fetches repos of your selected organization
       * @param  {string} name
       * @return {bool}
       */
      function fetchRepos(name) {
        githubService.fetchRepos(name).then(setRepos);
        return false;
      };


      /**
       * Step: Select Branch
       */
      function setBranches() {
        vm.title = "Branches";
        vm.step = 3;
        return vm.branches = githubService.config.branches;
      };


      /**
       * fetchBranches - fetch branches of your selected repo
       * @param  {string} name name of the repo
       * @return {[type]}      [description]
       */
      function fetchBranches(name) {
        githubService.config.current.repo = name;
        githubService.fetchBranches(name).then(setBranches);
        return false;
      };

      /**
       * Step: Select Files
       */
      function setTreeFiles() {
        vm.title = "Files";
        vm.step = 4;
        return vm.files = githubService.config.current.tree;
      };

      /**
       * fetchTreeFiles - fetch the file tree
       * @param  {string} sha sha of th file
       * @return {bool}
       */
      function fetchTreeFiles(sha) {
        githubService.config.current.sha = sha;
        githubService.fetchTreeFiles(sha).then(setTreeFiles);
        return false;
      };

});
