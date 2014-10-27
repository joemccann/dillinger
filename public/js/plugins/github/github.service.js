
'use strict';
module.exports = angular.module('plugins.github.service', []).factory('githubService', function($http, diNotify) {
  var defaults, service;
  defaults = {
    orgs: {},
    repos: {},
    branches: {},
    files: {},
    user: {
      name: "",
      url: ""
    },
    current: {
      tree: [],
      name: "",
      sha: "",
      branch: null,
      owner: null,
      repo: null,
      file: null,
      fileName: ""
    }
  };
  service = {
    config: {},
    registerUserAsOrg: function() {
      return service.config.orgs.push({
        name: service.config.user.name
      });
    },
    fetchFile: function(url) {
      return $http.post('import/github/file', {
        url: url
      }).success(function(data) {
        return service.config.current.file = data.data;
      }).error(function(err) {
        return diNotify({
          message: "An Error occured: " + err
        });
      });
    },
    fetchTreeFiles: function(sha, branch, repo, owner, fileExts) {
      var di;
      di = diNotify("Fetching Files...");
      return $http.post('import/github/tree_files', {
        owner: owner ? owner : service.config.user.name,
        repo: repo ? repo : service.config.current.repo,
        branch: branch ? branch : service.config.current.branch,
        sha: sha ? sha : service.config.current.sha,
        fileExts: fileExts ? fileExts : "md"
      }).success(function(data) {
        if (di != null) {
          di.$scope.$close();
        }
        service.config.current.owner = owner ? owner : service.config.user.name;
        service.config.current.repo = repo ? repo : service.config.current.repo;
        service.config.current.branch = branch ? branch : service.config.current.branch;
        service.config.current.sha = sha ? sha : service.config.current.sha;
        service.config.current.tree = data.tree;
        return console.log(service.config);
      }).error(function(err) {
        return diNotify({
          message: "An Error occured: " + err
        });
      });
    },
    fetchBranches: function(repo, owner) {
      var di;
      di = diNotify("Fetching Branches...");
      return $http.post('import/github/branches', {
        owner: owner ? owner : service.config.user.name,
        repo: repo ? repo : service.config.current.repo
      }).success(function(data) {
        if (di != null) {
          di.$scope.$close();
        }
        service.config.current.owner = owner;
        service.config.current.repo = repo;
        return service.config.branches = data;
      }).error(function(err) {
        return diNotify({
          message: "An Error occured: " + err
        });
      });
    },
    fetchRepos: function(owner) {
      var di;
      di = diNotify("Fetching Repos...");
      return $http.post('import/github/repos', {
        owner: owner
      }).success(function(data) {
        if (di != null) {
          di.$scope.$close();
        }
        service.config.current.owner = owner;
        return service.config.repos = data;
      }).error(function(err) {
        return diNotify({
          message: "An Error occured: " + err
        });
      });
    },
    fetchOrgs: function() {
      var di;
      di = diNotify("Fetching Organizations...");
      return $http.post('import/github/orgs').success(function(data) {
        if (di != null) {
          di.$scope.$close();
        }
        return service.config.orgs = data;
      }).error(function(err) {
        return diNotify({
          message: "An Error occured: " + err
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
