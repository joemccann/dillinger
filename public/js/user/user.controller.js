
'use strict';
module.exports = angular.module('diUser', ['diUser.service', 'diDocuments.service.wordcount']).controller('User', function($rootScope, $timeout, $modal, userService, wordsCountService) {
  var resetProfile, showAbout, toggleAutoSave, toggleNightMode, toggleWordsCount, updateWords, vm;
  vm = this;
  vm.profile = userService.profile;
  toggleAutoSave = function() {
    vm.profile.enableAutoSave = !vm.profile.enableAutoSave;
    return userService.save();
  };
  toggleWordsCount = function() {
    vm.profile.enableWordsCount = !vm.profile.enableWordsCount;
    return userService.save();
  };
  toggleNightMode = function() {
    vm.profile.enableNightMode = !vm.profile.enableNightMode;
    return userService.save();
  };
  resetProfile = function() {
    localStorage.clear();
    window.location.reload();
    return false;
  };
  updateWords = function() {
    $rootScope.words = wordsCountService.count();
    return $timeout(function() {
      return $rootScope.$apply();
    }, 0);
  };
  showAbout = function() {
    var modalInstance;
    return modalInstance = $modal.open({
      template: require('raw!../vendor/bootstrap-modal.directive.html'),
      controller: 'WTFisDillingerModalInstance',
      windowClass: 'modal--dillinger about'
    });
  };
  vm.toggleAutoSave = toggleAutoSave;
  vm.toggleWordsCount = toggleWordsCount;
  vm.toggleNightMode = toggleNightMode;
  vm.resetProfile = resetProfile;
  vm.showAbout = showAbout;
  $rootScope.$on('preview.updated', updateWords);
});
