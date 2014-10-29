
'use strict';

module.exports =
  angular
  .module('plugins.github', [
    'plugins.github.service',
    'plugins.github.modal'
  ])
  .controller('Github', function($rootScope, $modal, githubService, documentsService, diNotify) {

  var vm = this;

  vm.importFile = importFile;
  vm.saveTo     = saveTo;

  //////////////////////////////

  function importFile(username) {

    var modalInstance = $modal.open({
      template: require('raw!./github-modal.directive.html'),
      controller: 'GithubModal as modal',
      windowClass: 'modal--dillinger',
      resolve: {
        items: function() {
          githubService.config.user.name = username;
          return githubService.fetchOrgs().then(githubService.registerUserAsOrg);
        }
      }
    });

    return modalInstance.result.then(function() {
      documentsService.setCurrentDocumentTitle(githubService.config.current.fileName);
      documentsService.setCurrentDocumentBody(githubService.config.current.file);
      githubService.save();
      $rootScope.$emit('document.refresh');
      return $rootScope.$emit('autosave');
    }, function() {
      return console.log('Modal dismissed at: ' + (new Date()));
    });
  }

  function saveTo(username) {
    return diNotify({
      message: 'Saving to Github will be back soon, ' + username + '!'
    });
  }

});
