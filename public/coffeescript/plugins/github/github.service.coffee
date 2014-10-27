
'use strict'

module.exports =
  angular
  .module('plugins.github.service', [])
  .factory 'githubService',
  ($http, diNotify) ->

    defaults =
      orgs:     {}
      repos:    {}
      branches: {}
      files:    {}

      user:
        name: ""
        url: ""

      current:
        tree:     {}
        name:     ""
        sha:      ""
        branch:   null
        owner:    null
        repo:     null
        file:     null
        fileName: ""

    service =
      config: {}

      registerUserAsOrg: ->
        service.config.orgs.push
          name: service.config.user.name

      fetchFile: (url) ->
        $http.post('import/github/file',
          url: url
        )
        .success (data) ->
          service.config.current.file = data.data
        .error (err) ->
          diNotify(message: "An Error has happened: #{err}")

      fetchTreeFiles: (sha, branch, repo, owner, fileExts) ->
        di = diNotify("Fetching Files...")
        $http.post('import/github/tree_files',
          owner:  if owner then owner else service.config.user.name
          repo:   if repo then repo else service.config.current.repo
          branch: if branch then branch else service.config.current.branch
          sha: if sha then sha else service.config.current.sha
          fileExts: if fileExts then fileExts else "md"
        )
        .success (data) ->
          di?.$scope.$close()
          service.config.current.tree = data.tree
        .error (err) ->
          diNotify(message: "An Error has happened: #{err}")

      fetchBranches: (repo, owner) ->
        di = diNotify("Fetching Branches...")
        $http.post('import/github/branches',
          owner: if owner then owner else service.config.user.name
          repo: if repo then repo else service.config.current.repo
        )
        .success (data) ->
          di?.$scope.$close()
          service.config.branches =  data
        .error (err) ->
          diNotify(message: "An Error has happened: #{err}")

      fetchRepos: (owner) ->
        di = diNotify("Fetching Repos...")
        $http.post('import/github/repos',
          owner: owner
        )
        .success (data) ->
          di?.$scope.$close()
          service.config.repos =  data
        .error (err) ->
          diNotify(message: "An Error has happened: #{err}")

      fetchOrgs: ->
        di = diNotify("Fetching Organizations...")
        $http.post('import/github/orgs')
        .success (data) ->
          di?.$scope.$close()
          service.config.orgs =  data
        .error (err) ->
          diNotify(message: "An Error has happened: #{err}")

      save: ->
        localStorage.setItem('github', angular.toJson(service.config))
        return

      restore: ->
        service.config = angular.fromJson(localStorage.getItem('github')) or defaults
        return service.config

    service.restore()

    return service
