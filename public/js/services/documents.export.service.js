
'use strict';
module.exports =
  angular
  .module('diDocuments.export.service', ['diDocuments.service'])
  .factory('documentsExportService', function($http, documentsService, diNotify) {

  var service = {
    type: null,
    file: null,

    fetchHTML: function(styled) {
      var di = diNotify('Fetching HTML...');
      return $http.post('factory/fetch_html', {
        name: documentsService.getCurrentDocumentTitle(),
        unmd: documentsService.getCurrentDocumentBody(),
        formatting: styled ? styled : false
      }).success(function(response) {
        if (di != null) {
          di.$scope.$close();
        }
        service.type = 'html';
        return service.file = response.data;
      }).error(function(err) {
        return diNotify({
          message: "An Error occured: " + err
        });
      });
    },

    fetchPDF: function() {
      var di = diNotify('Fetching PDF...');

      return $http.post('factory/fetch_pdf', {
        name: documentsService.getCurrentDocumentTitle(),
        unmd: documentsService.getCurrentDocumentBody()
      }).success(function(response) {
        if (di != null) {
          di.$scope.$close();
        }
        service.type = 'pdf';
        return service.file = response.data;
      }).error(function(err) {
        return diNotify({
          message: "An Error occured: " + err
        });
      });
    },

    fetchMarkdown: function() {
      var di = diNotify('Fetching Markdown...');
      return $http.post('factory/fetch_markdown', {
        name: documentsService.getCurrentDocumentTitle(),
        unmd: documentsService.getCurrentDocumentBody()
      }).success(function(response) {
        if (di != null) {
          di.$scope.$close();
        }
        service.type = 'md';
        return service.file = response.data;
      }).error(function(err) {
        return diNotify({
          message: "An Error occured: " + err
        });
      });
    }
  };

  return service;
});
