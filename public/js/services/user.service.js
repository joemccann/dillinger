
'use strict';
module.exports =
  angular
  .module('diUser.service', [])
  .factory('userService', function() {

  var defaults = {
    enableAutoSave: true,
    enableWordsCount: true,
    enableNightMode: false
  };

  var service = {
    profile: {},
    save: function() {
      localStorage.setItem('profile', angular.toJson(service.profile));
    },
    restore: function() {
      service.profile = angular.fromJson(localStorage.getItem('profile')) || defaults;
      return service.profile;
    }
  };

  service.restore();

  return service;
});
