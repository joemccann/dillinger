
'use strict'

module.exports =
  angular
  .module('plugins.github.service', [])
  .factory 'githubService',
  ($http) ->

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
        console.log "registerUserAsOrg"
        service.config.orgs.push
          name: service.config.user.name

      fetchFile: (url) ->
        console.log "fetchFile"
        $http.post('import/github/file',
          url: url
        )
        .success (data) ->
          # console.log data
          service.config.current.file = data.data
        .error (err) ->
          console.log err

      fetchTreeFiles: (sha, branch, repo, owner, fileExts) ->
        console.log "fetchTreeFiles"
        $http.post('import/github/tree_files',
          owner:  if owner then owner else service.config.user.name
          repo:   if repo then repo else service.config.current.repo
          branch: if branch then branch else service.config.current.branch
          sha: if sha then sha else service.config.current.sha
          fileExts: if fileExts then fileExts else "md"
        )
        .success (data) ->
          # console.log data
          service.config.current.tree = data.tree
        .error (err) ->
          console.log err

      fetchBranches: (repo, owner) ->
        console.log "fetchBranches"
        $http.post('import/github/branches',
          owner: if owner then owner else service.config.user.name
          repo: if repo then repo else service.config.current.repo
        )
        .success (data) ->
          # console.log data
          service.config.branches =  data
        .error (err) ->
          console.log err

      fetchRepos: (owner) ->
        console.log "fetchRepos"
        $http.post('import/github/repos',
          owner: owner
        )
        .success (data) ->
          # console.log data
          service.config.repos =  data
        .error (err) ->
          console.log err

      fetchOrgs: ->
        $http.post('import/github/orgs')
        .success (data) ->
          # console.log data
          service.config.orgs =  data
        .error (err) ->
          console.log err

      save: ->
        sessionStorage.setItem('github', angular.toJson(service.config))
        return

      restore: ->
        service.config = angular.fromJson(sessionStorage.getItem('github')) or defaults
        return service.config

    service.restore()

    return service
