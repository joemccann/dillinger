
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
    saveFile: function(title, body, fileId, cb) {
      var di;
      di = diNotify({
        message: "Saving File to Google Drive...",
        duration: 5000
      });
      return $http.post('save/googledrive', {
        title: title,
        content: body,
        fileId: fileId
      }).then(function successCallback(data) {
        if (di != null) {
          di.$scope.$close();
        }
        if (window.ga) {
          ga('send', 'event', 'click', 'Save To Google Drive', 'Save To...')
        }
        cb(data.data.id);
        return diNotify({
          message: "Successfully saved to Google Drive",
          duration: 5000
        });
      }, function errorCallback(err) {
        return diNotify({
          message: "An Error occured: " + err
        });
      });
    },
    fetchFile: function(fileId) {
      return $http.get("fetch/googledrive?fileId=" + fileId).then(function successCallback(data) {
        service.fetched.fileId = fileId
        service.fetched.fileName = data.data.title;
        return service.fetched.file = data.data.content;
      }, function errorCallback(err) {
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
      return $http.get('import/googledrive').then(function(data) {
        if (di != null) {
          di.$scope.$close();
        }
        return service.files = data.data.items || [];
      }, function errorCallback(err) {
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
