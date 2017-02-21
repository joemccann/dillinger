
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
  vm.saveTo              = saveTo;
  vm.updateSHAOnDocument = updateSHAOnDocument;
  vm.chooseScope         = chooseScope;

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

  function updateSHAOnDocument(result) {
    documentsService.setCurrentDocumentSHA(result.data.content.sha);
    $rootScope.$emit('document.refresh');
    return $rootScope.$emit('autosave');
  }

  function saveTo(username) {
    var file = documentsService.getCurrentDocument();

    // Document must be an imported file from Bitbucket to work.
    if (file.isBitbucketFile) {

       prepareBitbucketCommit(function(bitbucketCommitMessage) {
        var filePath = file.bitbucket.path.substr(0,file.bitbucket.path.lastIndexOf('/'));
        var postData = {
          body:    file.body,
          path:    filePath ? filePath + '/' + file.title : file.title,
          sha:     file.bitbucket.sha,
          branch:  file.bitbucket.branch,
          repo:    file.bitbucket.repo,
          owner:   file.bitbucket.owner,
          uri:     file.bitbucket.url,
          message: bitbucketCommitMessage
        };

        return bitbucketService.saveToBitbucket(postData).then(vm.updateSHAOnDocument);

      }, file); // end prepareBitbucketCommit
    } else {
      return diNotify({
        message: 'Your Document must be an imported file from Bitbucket.'
      });
    } // end else
  } // end saveTo()

  function chooseScope() {
    var modalInstance = $modal.open({
      template: require('raw!./bitbucket-modal.scope.html'),
      controller: function($scope, $modalInstance){
        $scope.close = function () {
          $modalInstance.dismiss('cancel');
        };
      },
      windowClass: 'modal--dillinger scope',
    });
  };

  function prepareBitbucketCommit(callback, file) {
    var modalInstance = $modal.open({
      template: require('raw!./bitbucket-commit-message-modal.html'),
      controller: function($scope, $modalInstance) {
        $scope.close = function() {
          $modalInstance.dismiss('cancel');
        };
        $scope.commit = function() {
          var commitMessage = $scope.commitMessage || 'Saved ' + file.title + ' with Dillinger.io';
          if ($scope.skipCI)
            commitMessage = commitMessage + " [skip ci]";
          callback(commitMessage);
          $scope.close();
        };
        if (! userService.profile.enableBitbucketComment)
          $scope.commit();
      },
      windowClass: 'modal--dillinger scope',
    });
    if (! userService.profile.enableBitbucketComment)
        modalInstance.opened.then(function() { modalInstance.close()});
  };

});
