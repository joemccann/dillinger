
'use strict';
module.exports = angular.module('plugins.onedrive.service', []).factory('onedriveService', function($http, diNotify) {
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
        message: "Saving File to One Drive...",
        duration: 5000
      });
      return $http.post('save/onedrive', {
        title: title,
        content: body
      }).then(function successCallback(data) {
        if (di != null) {
          di.$scope.$close();
        }
        if (data.error != null) {
          return diNotify({
            message: "An Error occured: " + data.error.message,
            duration: 3000
          });
        } else {
          if (window.ga) {
            ga('send', 'event', 'click', 'Save To One Drive', 'Save To...')
          }
          return diNotify({
            message: "Successfully saved File to One Drive",
            duration: 5000
          });
        }
      }, function errorCallback(err) {
        return diNotify({
          message: "An Error occured: " + err.message
        });
      });
    },
    fetchFile: function(fileId, fileName) {
      return $http.get("fetch/onedrive?fileId=" + fileId).then(function successCallback(data) {
        return service.fetched.file = data.data.content;
      }, function errorCallback(err) {
        return diNotify({
          message: "An Error occured: " + err.message
        });
      });
    },
    fetchFiles: function() {
      var di;
      di = diNotify({
        message: "Fetching Markdown related files from One Drive...",
        duration: 5000
      });
      return $http.get('import/onedrive').then(function successCallback(data) {

        if (data && data.data.error) {
          if (di != null) {
            di.$scope.$close();
          }
          return diNotify({
            message: "An Error occured: " + data.data.error.message,
            duration: 3000
          });
        }

        if (di != null) {
          di.$scope.$close();
        }

        return service.files = data.data.data || [];

      }, function errorCallback(err) {
        return diNotify({
          message: "An Error occured: " + error.message
        });
      });
    },
    save: function() {
      localStorage.setItem('onedrive', angular.toJson(service.fetched));
    },
    restore: function() {
      service.fetched = angular.fromJson(localStorage.getItem('onedrive')) || defaults;
      return service.fetched;
    }
  };
  service.restore();
  return service;
});
