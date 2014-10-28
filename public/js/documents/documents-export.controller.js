
'use strict';
module.exports =
  angular
  .module('diDocuments.export', [
    'diDocuments.service',
    'diDocuments.export.service'
  ])
  .controller('DocumentsExport', function($scope, documentsExportService) {

  var vm = this,
      $downloader = document.getElementById('downloader');

  vm.asHTML       = asHTML;
  vm.asStyledHTML = asStyledHTML;
  vm.asMarkdown   = asMarkdown;
  vm.asPDF        = asPDF;

  function initDownload() {
    return $downloader.src = "/files/" + documentsExportService.type + "/" + documentsExportService.file;
  };

  function asHTML(styled) {
    return documentsExportService.fetchHTML(styled).then(initDownload);
  };

  function asStyledHTML() {
    return asHTML(true);
  };

  function asMarkdown() {
    return documentsExportService.fetchMarkdown().then(initDownload);
  };

  function asPDF() {
    return documentsExportService.fetchPDF().then(initDownload);
  };

  $scope.$on('$destroy', function() {
    vm = null;
    $scope = null;
    return;
  });

});
