
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
      }).success(function(data) {
        if (di != null) {
          di.$scope.$close();
        }
        if (data.error != null) {
          return diNotify({
            message: "An Error occured: " + data.error.message,
            duration: 3000
          });
        } else {
          return diNotify({
            message: "Successfully saved File to One Drive",
            duration: 5000
          });
        }
      }).error(function(err) {
        return diNotify({
          message: "An Error occured: " + err
        });
      });
    },
    fetchFile: function(fileId, fileName) {
      return $http.get("fetch/onedrive?fileId=" + fileId).success(function(data) {
        return service.fetched.file = data.content;
      }).error(function(err) {
        return diNotify({
          message: "An Error occured: " + err
        });
      });
    },
    fetchFiles: function() {
      var di;
      di = diNotify({
        message: "Fetching Markdown related files from One Drive...",
        duration: 5000
      });
      return $http.get('import/onedrive').success(function(data) {
        if (di != null) {
          di.$scope.$close();
        }
        return service.files = data.data || [];
      }).error(function(err) {
        return diNotify({
          message: "An Error occured: " + err
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
