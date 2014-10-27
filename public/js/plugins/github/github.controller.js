
'use strict';
module.exports = angular.module('plugins.github', ['plugins.github.service', 'plugins.github.modal']).controller('Github', function($rootScope, $modal, githubService, documentsService, diNotify) {
  var importFile, saveTo, vm;
  vm = this;
  importFile = function(username) {
    var modalInstance;
    modalInstance = $modal.open({
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
      return console.log("Modal dismissed at: " + (new Date()));
    });
  };
  saveTo = function(username) {
    return diNotify({
      message: "Saving to Github will be back soon, " + username + "!"
    });
  };
  vm.importFile = importFile;
  vm.saveTo = saveTo;
});
