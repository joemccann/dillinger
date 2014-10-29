
'use strict';

module.exports =
  angular
  .module('plugins.dropbox.service', [])
  .factory('dropboxService', function($http, diNotify) {

  var defaults = {
    files: []
  },

  service = {

    fetched: {
      fileName: '',
      file: null
    },

    /**
     *    Save File to Dropbox.
     *    The file will put into the Dropbox/Dillinger/ directory of your
     *    Dropbox Account.
     *
     *    @param    {String}    title    Title of the Document
     *    @param    {String}    body     Body of the Document
     */
    saveFile: function(title, body) {
      var di = diNotify({
        message: 'Saving File to Dropbox...',
        duration: 5000
      });
      return $http.post('save/dropbox', {
        pathToMdFile: '/Dillinger/' + title,
        fileContents: body
      }).success(function(data) {
        if (angular.isDefined(di.$scope)) {
          di.$scope.$close();
        }
        return diNotify({
          message: 'Successfully saved to: ' + data.path,
          duration: 5000
        });
      }).error(function(err) {
        return diNotify({
          message: 'An Error occured: ' + err
        });
      });
    },

    /**
     *    Fetch File from Dropbox.
     *
     *    @param    {String}    filePath    Path to the file on Dropbox.
     */
    fetchFile: function(filePath) {
      return $http.post('fetch/dropbox', {
        mdFile: filePath
      }).success(function(data) {
        service.fetched.file = data.data;
        return service.fetched.file;
      }).error(function(err) {
        return diNotify({
          message: 'An Error occured: ' + err
        });
      });
    },

    /**
     *    Fetch all Markdown related Files from Dropbox.
     */
    fetchFiles: function() {
      var di = diNotify({
        message: 'Fetching Markdown related files from Dropbox...',
        duration: 5000
      });
      return $http.post('import/dropbox', {
        fileExts: 'md'
      }).success(function(data) {
        if (angular.isDefined(di.$scope)) {
          di.$scope.$close();
        }
        service.files = data;
        return service.files;
      }).error(function(err) {
        return diNotify({
          message: 'An Error occured: ' + err
        });
      });
    },
    
    save: function() {
      localStorage.setItem('dropbox', angular.toJson(service.fetched));
      return false;
    },

    restore: function() {
      service.fetched = angular.fromJson(localStorage.getItem('dropbox')) || defaults;
      return service.fetched;
    }
  };

  service.restore();

  return service;
});
