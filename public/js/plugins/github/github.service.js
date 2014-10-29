
'use strict';

module.exports =
  angular
  .module('plugins.github.service', [])
  .factory('githubService', function($http, diNotify) {

  var defaults = {
    orgs: {},
    repos: {},
    branches: {},
    files: {},
    user: {
      name: '',
      url: ''
    },
    current: {
      tree: [],
      name: '',
      sha: '',
      branch: null,
      owner: null,
      repo: null,
      file: null,
      fileName: ''
    }
  },

  service = {

    config: {},

    /**
     *    Add the User to the Organizations Array, as we want to let him
     *    search through his own Repos.
     */
    registerUserAsOrg: function() {
      return service.config.orgs.push({
        name: service.config.user.name
      });
    },

    /**
     *    Fetch the File from Github.
     *
     *    @param    {String}    url    URL to the File
     */
    fetchFile: function(url) {
      return $http.post('import/github/file', {
        url: url
      }).success(function(data) {
        service.config.current.file = data.data;
        return service.config.current.file;
      }).error(function(err) {
        return diNotify({
          message: 'An Error occured: ' + err
        });
      });
    },

    /**
     *    Fetches the File Tree of the current Branch.
     *
     *    @param    {String}    sha         SHA of the File
     *    @param    {String}    branch      Selected Branch
     *    @param    {String}    repo        Selected Repo
     *    @param    {String}    owner       Owner of the Repo
     *    @param    {String}    fileExts    File Extensions (.md,.markdown etc.)
     */
    fetchTreeFiles: function(sha, branch, repo, owner, fileExts) {
      var di;
      di = diNotify('Fetching Files...');
      return $http.post('import/github/tree_files', {
        owner: owner ? owner : service.config.user.name,
        repo: repo ? repo : service.config.current.repo,
        branch: branch ? branch : service.config.current.branch,
        sha: sha ? sha : service.config.current.sha,
        fileExts: fileExts ? fileExts : 'md'
      }).success(function(data) {
        if (di != null) {
          di.$scope.$close();
        }
        service.config.current.owner = owner ? owner : service.config.user.name;
        service.config.current.repo = repo ? repo : service.config.current.repo;
        service.config.current.branch = branch ? branch : service.config.current.branch;
        service.config.current.sha = sha ? sha : service.config.current.sha;
        service.config.current.tree = data.tree;
        return service.config.current;
      }).error(function(err) {
        return diNotify({
          message: 'An Error occured: ' + err
        });
      });
    },

    /**
     *    Fetch the selected Branch.
     *
     *    @param    {String}    repo     Repo Name
     *    @param    {String}    owner    Owner of the Repo
     */
    fetchBranches: function(repo, owner) {
      var di;
      di = diNotify('Fetching Branches...');
      return $http.post('import/github/branches', {
        owner: owner ? owner : service.config.user.name,
        repo: repo ? repo : service.config.current.repo
      }).success(function(data) {
        if (di != null) {
          di.$scope.$close();
        }
        service.config.current.owner = owner;
        service.config.current.repo = repo;
        service.config.branches = data;

        return service.config.branches;
      }).error(function(err) {
        return diNotify({
          message: 'An Error occured: ' + err
        });
      });
    },

    /**
     *    Fetch Repos of the selected Organization.
     *
     *    @param    {String}    owner    Owner Name
     */
    fetchRepos: function(owner) {
      var di;
      di = diNotify('Fetching Repos...');
      return $http.post('import/github/repos', {
        owner: owner
      }).success(function(data) {
        if (di != null) {
          di.$scope.$close();
        }
        service.config.current.owner = owner;
        service.config.repos = data;

        return service.config.repos;
      }).error(function(err) {
        return diNotify({
          message: 'An Error occured: ' + err
        });
      });
    },

    /**
     *    Fetch all known Organizations from the User.
     */
    fetchOrgs: function() {
      var di;
      di = diNotify('Fetching Organizations...');
      return $http.post('import/github/orgs').success(function(data) {
        if (di != null) {
          di.$scope.$close();
        }
        service.config.orgs = data;

        return service.config.orgs;
      }).error(function(err) {
        return diNotify({
          message: 'An Error occured: ' + err
        });
      });
    },

    save: function() {
      localStorage.setItem('github', angular.toJson(service.config));
    },

    restore: function() {
      service.config = angular.fromJson(localStorage.getItem('github')) || defaults;
      return service.config;
    }

  };
  service.restore();
  return service;
});
