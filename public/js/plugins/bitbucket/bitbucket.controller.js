
'use strict';

module.exports =
  angular
  .module('plugins.bitbucket', [
    'plugins.bitbucket.service',
    'plugins.bitbucket.modal'
  ])
  .controller('Bitbucket', function($rootScope, $modal, bitbucketService, documentsService, diNotify, userService) {

  var vm = this;

  vm.importFile          = importFile;

  //////////////////////////////

  (function() {
    setInterval(function() {
      bitbucketService.refreshToken();
    }, 60000 * 15)
  })();

  function importFile(username) {

    var closeModal;
    var modalInstance = $modal.open({
      template: require('raw!./bitbucket-modal.directive.html'),
      controller: 'BitbucketModal as modal',
      windowClass: 'modal--dillinger',
      resolve: {
        items: function() {
          bitbucketService.config.user.name = username;
          return bitbucketService.fetchOrgs().then(bitbucketService.registerUserAsOrg)
          .catch(function(error) {
            closeModal(error);
          });
        }
      }
    });
    closeModal = modalInstance.close;
    return modalInstance.result.then(function() {
      var file = documentsService.createItem({
        isBitbucketFile: true,
        body:         bitbucketService.config.current.file,
        title:        bitbucketService.config.current.fileName,
        bitbucket: {
          originalFileName:    bitbucketService.config.current.fileName,
          originalFileContent: bitbucketService.config.current.file,
          sha:                 bitbucketService.config.current.sha,
          branch:              bitbucketService.config.current.branch,
          owner:               bitbucketService.config.current.owner,
          repo:                bitbucketService.config.current.repo,
          url:                 bitbucketService.config.current.url,
          path:                bitbucketService.config.current.path
        }
      });

      documentsService.addItem(file);
      documentsService.setCurrentDocument(file);

      bitbucketService.save();
      $rootScope.$emit('document.refresh');
      return $rootScope.$emit('autosave');
    });
  }

});
