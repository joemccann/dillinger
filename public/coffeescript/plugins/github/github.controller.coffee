
'use strict'

module.exports =
  angular
  .module('plugins.github', ['plugins.github.service', 'plugins.github.modal'])
  .controller 'Github',
  ($rootScope, $modal, githubService, documentsService, diNotify) ->

    vm = @

    importFile = (username) ->

      modalInstance = $modal.open
        template: require('raw!./github-modal.directive.html')
        controller: 'GithubModal as modal'
        windowClass: 'modal--dillinger'
        resolve:
          items: ->
            githubService.config.user.name = username
            githubService.fetchOrgs()
              .then(githubService.registerUserAsOrg)

      modalInstance.result.then ->
        documentsService.setCurrentDocumentTitle(githubService.config.current.fileName)
        documentsService.setCurrentDocumentBody(githubService.config.current.file)
        githubService.save()
        $rootScope.$emit 'document.refresh'
        $rootScope.$emit 'autosave'
      , ->
        console.log "Modal dismissed at: #{new Date()}"

    saveTo = (username) ->
      diNotify(message: "Saving to Github will be back soon, #{username}!")

    vm.importFile = importFile
    vm.saveTo = saveTo

    return
