
'use strict';
module.exports =
  angular
  .module('diUser', [
    'diUser.service',
    'diDocuments.service.wordcount'
  ])
  .controller('User', function($rootScope, $timeout, $modal, userService, wordsCountService) {

  var vm = this;

  vm.profile = userService.profile;

  vm.toggleAutoSave   = toggleAutoSave;
  vm.toggleWordsCount = toggleWordsCount;
  vm.toggleNightMode  = toggleNightMode;
  vm.resetProfile     = resetProfile;
  vm.showAbout        = showAbout;

  $rootScope.$on('preview.updated', updateWords);

  function toggleAutoSave() {
    vm.profile.enableAutoSave = !vm.profile.enableAutoSave;
    userService.save();
    return false;
  };
  function toggleWordsCount() {
    vm.profile.enableWordsCount = !vm.profile.enableWordsCount;
    userService.save();
    return false;
  };
  function toggleNightMode() {
    vm.profile.enableNightMode = !vm.profile.enableNightMode;
    userService.save();
    return false;
  };
  function resetProfile() {
    localStorage.clear();
    window.location.reload();
    return false;
  };
  function updateWords() {
    $rootScope.words = wordsCountService.count();
    return $timeout(function() {
      return $rootScope.$apply();
    }, 0);
  };
  function showAbout() {

    var modalInstance = $modal.open({
      template: require('raw!../vendor/bootstrap-modal.directive.html'),
      controller: 'WTFisDillingerModalInstance',
      windowClass: 'modal--dillinger about'
    });

    return false;
  };
});
