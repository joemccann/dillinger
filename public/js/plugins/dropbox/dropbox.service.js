
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
    }).then(
      function successCallback(response){
      if (angular.isDefined(di.$scope)) {
        di.$scope.$close();
      }
      if (response.data.error) {
        return diNotify({
          message: 'An Error occured: ' + response.data.error,
          duration: 5000
        });
      } else {
        if (window.ga) {
          ga('send', 'event', 'click', 'Save To Dropbox', 'Save To...')
        }
        return diNotify({
          message: 'Successfully saved to: ' + response.data.data.path_display,
          duration: 5000
        });
      }
      }, function errorCallback(err){
        return diNotify({
          message: 'An Error occured: ' + err
        });
      });

  } // end saveToFile

  /**
   *    Fetch File from Dropbox.
   *
   *    @param  {String}  filePath  Path to the file on Dropbox.
   */
  function fetchFile(filePath) {
    return $http.post('fetch/dropbox', {mdFile: filePath}).then(
      function successCallback(response){
        dropboxService.fetched.file = response.data.data;
        return dropboxService.fetched.file;
      }, function errorCallback(err){
        return diNotify({
          message: 'An Error occured: ' + err
        });
      });
  } // end fetchFile

  /**
   *    Fetch all Markdown related Files from Dropbox.
   */
  function fetchFiles() {
    dropboxService.di = diNotify({
      message: 'Fetching Markdown related files from Dropbox...',
      duration: 5000
    });

    return $http.post('import/dropbox', {fileExts: 'md'}).then(
      function successCallback(response){
        if (angular.isDefined(dropboxService.di.$scope)) {
          dropboxService.di.$scope.$close();
        }
        dropboxService.files = response.data;
        return dropboxService.files;
      }, function errorCallback(err){
          return diNotify({
            message: 'An Error occured: ' + err
          });
      });
  } // end fetchfiles

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
