
'use strict'

module.exports =
  angular
  .module('plugins.github.modal', [])
  .controller 'GithubModal',
  ($modalInstance, githubService) ->

    vm = @

    vm.title = "Organizations"
    vm.orgs = githubService.config.orgs

    vm.step = 1

    setFile = ->
      $modalInstance.close()

    fetchFile = (url, name) ->
      githubService.config.current.fileName = name.split('/').pop()
      githubService.fetchFile(url)
        .then(setFile)
      false

    setTreeFiles = ->
      vm.title = "Files"
      vm.step  = 4
      vm.files = githubService.config.current.tree

    fetchTreeFiles = (sha) ->
      githubService.config.current.sha = sha
      githubService.fetchTreeFiles(sha)
        .then(setTreeFiles)
      false

    setBranches = ->
      vm.title    = "Branches"
      vm.step     = 3
      vm.branches = githubService.config.branches

    fetchBranches = (name) ->
      githubService.config.current.repo = name
      githubService.fetchBranches(name)
        .then(setBranches)
      false

    setRepos = ->
      vm.title = "Reporsitories"
      vm.step  = 2
      vm.repos = githubService.config.repos

    fetchRepos = (name) ->
      githubService.fetchRepos(name)
        .then(setRepos)
      false

    vm.fetchRepos = fetchRepos
    vm.fetchBranches = fetchBranches
    vm.fetchTreeFiles = fetchTreeFiles
    vm.fetchFile = fetchFile

    return
