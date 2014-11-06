
'use strict';
module.exports =
  angular
  .module('diUser.service', [])
  .factory('userService', function() {

  var
    defaults = {
      enableAutoSave:   true,
      enableWordsCount: true,
      enableNightMode:  false
    },
    service = {
      profile: {},
      save:    save,
      restore: restore
    };

  service.restore();

  return service;

  //////////////////////////////

  function save() {
    localStorage.setItem('profileV3', angular.toJson(service.profile));
  }

  function restore() {
    service.profile = angular.fromJson(localStorage.getItem('profileV3')) || defaults;
    return service.profile;
  }

});
