
'use strict';
module.exports = angular.module('diDocuments.export', ['diDocuments.service', 'diDocuments.export.service']).controller('DocumentsExport', function($scope, documentsExportService) {
  var $downloader, asHTML, asMarkdown, asPDF, asStyledHTML, initDownload, vm;
  vm = this;
  $downloader = document.getElementById('downloader');
  initDownload = function() {
    return $downloader.src = "/files/" + documentsExportService.type + "/" + documentsExportService.file;
  };
  asHTML = function(styled) {
    return documentsExportService.fetchHTML(styled).then(initDownload);
  };
  asStyledHTML = function() {
    return asHTML(true);
  };
  asMarkdown = function() {
    return documentsExportService.fetchMarkdown().then(initDownload);
  };
  asPDF = function() {
    return documentsExportService.fetchPDF().then(initDownload);
  };
  $scope.$on('$destroy', function() {
    vm = null;
    return $scope = null;
  });
  vm.asHTML = asHTML;
  vm.asStyledHTML = asStyledHTML;
  vm.asMarkdown = asMarkdown;
  vm.asPDF = asPDF;
});
