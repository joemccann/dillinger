
'use strict';
module.exports = angular.module('plugins.googledrive.service', []).factory('googledriveService', function($http, diNotify) {
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
        message: "Saving File to Google Drive...",
        duration: 5000
      });
      return $http.post('save/googledrive', {
        title: title,
        content: body
      }).success(function(data) {
        if (di != null) {
          di.$scope.$close();
        }
        return diNotify({
          message: "Successfully saved to Google Drive",
          duration: 5000
        });
      }).error(function(err) {
        return diNotify({
          message: "An Error occured: " + err
        });
      });
    },
    fetchFile: function(fileId) {
      return $http.get("fetch/googledrive?fileId=" + fileId).success(function(data) {
        service.fetched.fileName = data.title;
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
        message: "Fetching Markdown related files from Google Drive...",
        duration: 5000
      });
      return $http.get('import/googledrive').success(function(data) {
        if (di != null) {
          di.$scope.$close();
        }
        return service.files = data.items || [];
      }).error(function(err) {
        return diNotify({
          message: "An Error occured: " + err
        });
      });
    },
    save: function() {
      localStorage.setItem('googledrive', angular.toJson(service.fetched));
    },
    restore: function() {
      service.fetched = angular.fromJson(localStorage.getItem('googledrive')) || defaults;
      return service.fetched;
    }
  };
  service.restore();
  return service;
});
