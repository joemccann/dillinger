'use strict';

/**
 *    Medium Service to handle requests.
 */

module.exports =
angular.module('plugins.medium.service', []).factory('mediumService', function($http, diNotify) {
  var defaults, service;
  defaults = {
    files: []
  };
  service = {
    fetched: {
      fileName: "",
      file: null
    },
    saveFile: function(title, body) {
      var di;
      di = diNotify({
        message: "Saving File to Medium...",
        duration: 5000
      });
      return $http.post('save/medium', {
        title: title,
        content: body
      }).success(function(data) {
        if (di != null) {
          di.$scope.$close();
        }
        if (window.ga) {
          ga('send', 'event', 'click', 'Save To Medium', 'Save To...')
        }
        return diNotify({
          message: "Successfully saved to Medium",
          duration: 5000
        });
      }).error(function(err) {
        return diNotify({
          message: "An Error occured: " + err,
          duration: 5000
        });
      });
    },
    save: function() {
      localStorage.setItem('medium', angular.toJson(service.fetched));
    },
    restore: function() {
      service.fetched = angular.fromJson(localStorage.getItem('medium')) || defaults;
      return service.fetched;
    }
  };
  service.restore();
  return service;
});
