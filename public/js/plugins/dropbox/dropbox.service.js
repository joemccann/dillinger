
'use strict';
module.exports = angular.module('plugins.dropbox.service', []).factory('dropboxService', function($http, diNotify) {
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
        message: "Saving File to Dropbox...",
        duration: 5000
      });
      return $http.post('save/dropbox', {
        pathToMdFile: "/Dillinger/" + title,
        fileContents: body
      }).success(function(data) {
        if (di != null) {
          di.$scope.$close();
        }
        return diNotify({
          message: "Successfully saved to: " + data.path,
          duration: 5000
        });
      }).error(function(err) {
        return diNotify({
          message: "An Error occured: " + err
        });
      });
    },
    fetchFile: function(mdFile) {
      return $http.post('fetch/dropbox', {
        mdFile: mdFile
      }).success(function(data) {
        return service.fetched.file = data.data;
      }).error(function(err) {
        return diNotify({
          message: "An Error occured: " + err
        });
      });
    },
    fetchFiles: function() {
      var di;
      di = diNotify({
        message: "Fetching Markdown related files from Dropbox...",
        duration: 5000
      });
      return $http.post('import/dropbox', {
        fileExts: 'md'
      }).success(function(data) {
        if (di != null) {
          di.$scope.$close();
        }
        return service.files = data;
      }).error(function(err) {
        return diNotify({
          message: "An Error occured: " + err
        });
      });
    },
    save: function() {
      localStorage.setItem('dropbox', angular.toJson(service.fetched));
    },
    restore: function() {
      service.fetched = angular.fromJson(localStorage.getItem('dropbox')) || defaults;
      return service.fetched;
    }
  };
  service.restore();
  return service;
});
