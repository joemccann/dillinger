
'use strict';

/**
 *    Dropbox Service to handle requests.
 */

module.exports =
  angular
  .module('plugins.dropbox.service', [])
  .factory('dropboxService', function($http, diNotify) {

  var defaults = {
    files: []
  },

  dropboxService = {
    fetched: {
      fileName: '',
      file: null
    },

    saveFile: saveFile,
    fetchFile: fetchFile,
    fetchFiles: fetchFiles,
    save: save,
    restore: restore
  };

  return dropboxService;

  /**
   *    Save File to Dropbox.
   *    The file will be put into the Dropbox/Dillinger directory.
   *
   *    @param  {String}  title  Title of the document.
   *    @param  {String}  body   Body of the document.
   *
   *    @examples
   *    var
   *    title = 'Document Title.md',
   *    body  = 'Document Body text!';
   *
   */
  function saveFile(title, body) {
    var di = diNotify({
      message: 'Saving File to Dropbox...',
      duration: 5000
    });
    return $http.post('save/dropbox', {
      pathToMdFile: '/Dillinger/' + title,
      fileContents: body
    }).success(function(result) {
      if (angular.isDefined(di.$scope)) {
        di.$scope.$close();
      }
      if (result.data.error) {
        return diNotify({
          message: 'An Error occured: ' + result.data.error,
          duration: 5000
        });
      } else {
        return diNotify({
          message: 'Successfully saved to: ' + result.data.path,
          duration: 5000
        });
      }
    }).error(function(err) {
      return diNotify({
        message: 'An Error occured: ' + err
      });
    });
  }

  /**
   *    Fetch File from Dropbox.
   *
   *    @param  {String}  filePath  Path to the file on Dropbox.
   */
  function fetchFile(filePath) {
    return $http.post('fetch/dropbox', {
      mdFile: filePath
    }).success(function(data) {
      dropboxService.fetched.file = data.data;
      return dropboxService.fetched.file;
    }).error(function(err) {
      return diNotify({
        message: 'An Error occured: ' + err
      });
    });
  }

  /**
   *    Fetch all Markdown related Files from Dropbox.
   */
  function fetchFiles() {
    dropboxService.di = diNotify({
      message: 'Fetching Markdown related files from Dropbox...',
      duration: 5000
    });
    return $http.post('import/dropbox', {
      fileExts: 'md'
    }).success(function(data) {
      if (angular.isDefined(dropboxService.di.$scope)) {
        dropboxService.di.$scope.$close();
      }
      dropboxService.files = data;
      return dropboxService.files;
    }).error(function(err) {
      return diNotify({
        message: 'An Error occured: ' + err
      });
    });
  }

  function save() {
    localStorage.setItem('dropbox', angular.toJson(dropboxService.fetched));
    return false;
  }

  function restore() {
    dropboxService.fetched = angular
      .fromJson(localStorage.getItem('dropbox')) || defaults;
    return dropboxService.fetched;
  }

});
