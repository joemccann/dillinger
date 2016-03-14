
'use strict';

module.exports =
  angular
  .module('diDocuments.export', [
    'diDocuments.service'
  ])
  .controller('DocumentsExport', function($scope, documentsService) {

  var vm = this,
      $ = jQuery,
      $downloader = $(document.getElementById('downloader')),
      $name = $downloader.find('[name=name]'),
      $unmd = $downloader.find('[name=unmd]'),
      $formatting = $downloader.find('[name=formatting]');


  vm.asHTML       = asHTML;
  vm.asStyledHTML = asStyledHTML;
  vm.asMarkdown   = asMarkdown;
  vm.asPDF        = asPDF;

  function initDownload(action, styled) {
    $downloader[0].action = action;
    $name.val( documentsService.getCurrentDocumentTitle() );
    $unmd.val( documentsService.getCurrentDocumentBody() );
    $formatting.val( styled );

    $downloader.submit();
  }

  function asHTML(styled) {
    initDownload( 'factory/fetch_html', styled );
  }

  function asStyledHTML() {
    asHTML(true);
  }

  function asMarkdown() {
    initDownload( 'factory/fetch_markdown' );
  }

  function asPDF() {
    initDownload( 'factory/fetch_pdf' );
  }

  $scope.$on('$destroy', function() {
    vm     = null;
    $scope = null;

    return false;
  });

});
