
'use strict';
module.exports =
  angular
  .module('diUser.service', [])
  .factory('userService', function() {

  var
    defaults = {
      enableAutoSave:        true,
      enableWordsCount:      true,
      enableCharactersCount: true,
      enableScrollSync:      false,
      tabSize:               4,
      enableNightMode:       false,
      enableGitHubComment:   true
    },
    service = {
      profile: {},
      save:    save,
      restore: restore
    };

  service.restore();

  return service;

  //////////////////////////////

  function save(obj) {
    localStorage.setItem('profileV3', angular.toJson(obj || service.profile));
  }

  function restore() {
    service.profile = angular.fromJson(localStorage.getItem('profileV3')) || defaults;
    return service.profile;
  }

});
