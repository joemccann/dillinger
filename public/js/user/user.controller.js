
'use strict';

module.exports =
  angular
  .module('diUser', [
    'diUser.service',
    'diDocuments.service.wordcount'
  ])
  .controller('User', function($rootScope, $timeout, $modal, userService, wordsCountService) {

  // I.
  // Self-reference
  var vm = this;

  // II.
  // Requirements
  vm.profile = userService.profile;

  // III.
  // Scope Stuff

  // III. a)
  // Watchers

  // III. b)
  // Scope Methods

  // III. c)
  // Listen to Events
  $rootScope.$on('preview.updated', updateWords);

  // IV.
  // Methods on the Controller
  vm.toggleAutoSave   = toggleAutoSave;
  vm.toggleWordsCount = toggleWordsCount;
  vm.toggleNightMode  = toggleNightMode;
  vm.resetProfile     = resetProfile;
  vm.showAbout        = showAbout;

  // IV. a)
  // Properties on the Controller

  // V.
  // Cleanup

  // VI.
  // Implementation
  // ------------------------------

  function toggleAutoSave(e) {
    e.preventDefault();
    vm.profile.enableAutoSave = !vm.profile.enableAutoSave;
    userService.save();

    return false;
  }

  function toggleWordsCount(e) {
    e.preventDefault();
    vm.profile.enableWordsCount = !vm.profile.enableWordsCount;
    userService.save();

    return false;
  }

  function toggleNightMode(e) {
    e.preventDefault();
    vm.profile.enableNightMode = !vm.profile.enableNightMode;
    userService.save();

    return false;
  }

  function resetProfile(e) {
    e.preventDefault();
    localStorage.clear();
    window.location.reload();

    return false;
  }

  function updateWords() {
    $rootScope.words = wordsCountService.count();

    return $timeout(function() {
      return $rootScope.$apply();
    }, 0);
  }

  function showAbout(e) {
    e.preventDefault();
    $modal.open({
      template: require('raw!../components/wtfisdillinger-modal.directive.html'),
      controller: 'WTFisDillingerModalInstance',
      windowClass: 'modal--dillinger about'
    });

    return false;
  }

});
