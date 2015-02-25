
'use strict';

/**
 *    Document Export Service
 */

module.exports =
  angular
  .module('diDocuments.export.service', ['diDocuments.service'])
  .factory('documentsExportService', function($http, documentsService, diNotify) {

  var service = {
    type: null,
    file: null,

    fetchHTML:     fetchHTML,
    fetchPDF:      fetchPDF,
    fetchMarkdown: fetchMarkdown
  };

  return service;

  /**
   *    Fetch current document as HTML file.
   *
   *    @param  {Bool}  styled  If true, the returned HTML file has some basic
   *                            CSS styles thereby.
   */
  function fetchHTML(styled) {
    var di = diNotify('Fetching HTML...');
    return $http.post('factory/fetch_html', {
      name: documentsService.getCurrentDocumentTitle(),
      unmd: documentsService.getCurrentDocumentBody(),
      formatting: styled ? styled : false
    }).success(function(response) {
      if (di.$scope !== null) {
        di.$scope.$close();
      }
      // This is needed to set the right path on the iframe.
      service.type = 'html';
      service.file = response.data;
      return response.data;
    }).error(function(err) {
      return diNotify({
        message: 'An Error occured: ' + err
      });
    });
  }

  /**
   *    Fetch current document as PDF file.
   */
  function fetchPDF() {
    var di = diNotify('Fetching PDF...');

    return $http.post('factory/fetch_pdf', {
      name: documentsService.getCurrentDocumentTitle(),
      unmd: documentsService.getCurrentDocumentBody()
    }).success(function(response) {
      if (di.$scope !== null) {
        di.$scope.$close();
      }
      // This is needed to set the right path on the iframe.
      service.type = 'pdf';
      service.file = response.data;
      return response.data;
    }).error(function(err) {
      return diNotify({
        message: 'An Error occured: ' + err
      });
    });
  }

  /**
   *    Fetch current document as Markdown file.
   */
  function fetchMarkdown() {
    var di = diNotify('Fetching Markdown...');
    return $http.post('factory/fetch_markdown', {
      name: documentsService.getCurrentDocumentTitle(),
      unmd: documentsService.getCurrentDocumentBody()
    }).success(function(response) {
      if (di.$scope !== null) {
        di.$scope.$close();
      }
      // This is needed to set the right path on the iframe.
      service.type = 'md';
      service.file = response.data;
      return response.data;
    }).error(function(err) {
      return diNotify({
        message: 'An Error occured: ' + err
      });
    });
  }

});
