
'use strict'

module.exports =
  angular
  .module('plugins.github.modal', [])
  .controller 'GithubModal',
  ($modalInstance, githubService) ->

    vm = @

    vm.title = "Organizations"
    vm.orgs = githubService.config.orgs

    vm.showOrgs     = true
    vm.showRepos    = false
    vm.showBranches = false
    vm.showFiles    = false

    setFile = ->
      $modalInstance.close()

    fetchFile = (url, name) ->
      githubService.config.current.fileName = name.split('/').pop()
      githubService.fetchFile(url)
        .then(setFile)
      false

    setTreeFiles = ->
      vm.title        = "Files"
      vm.showBranches = false
      vm.files        = githubService.config.current.tree
      vm.showFiles    = true

    fetchTreeFiles = (sha) ->
      githubService.config.current.sha = sha
      githubService.fetchTreeFiles(sha)
        .then(setTreeFiles)
      false

    setBranches = ->
      vm.title        = "Branches"
      vm.showRepos    = false
      vm.branches     = githubService.config.branches
      vm.showBranches = true

    fetchBranches = (name) ->
      githubService.config.current.repo = name
      githubService.fetchBranches(name)
        .then(setBranches)
      false

    setRepos = ->
      vm.title     = "Reporsitories"
      vm.showOrgs  = false
      vm.repos     = githubService.config.repos
      vm.showRepos = true

    fetchRepos = (name) ->
      githubService.fetchRepos(name)
        .then(setRepos)
      false

    vm.fetchRepos = fetchRepos
    vm.fetchBranches = fetchBranches
    vm.fetchTreeFiles = fetchTreeFiles
    vm.fetchFile = fetchFile

    return
