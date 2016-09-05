
'use strict';

module.exports =
  angular
  .module('diDocuments.export', [
    'diDocuments.service'
  ])
  .controller('DocumentsExport', function($scope, $attrs, documentsService) {

  var vm = this,
      $ = jQuery,
      $downloader = $('#downloader'),
      $name = $downloader.find('[name=name]'),
      $unmd = $downloader.find('[name=unmd]'),
      $formatting = $downloader.find('[name=formatting]'),
      $preview = $downloader.find('[name=preview]');


  vm.asHTML       = asHTML;
  vm.asStyledHTML = asStyledHTML;
  vm.asMarkdown   = asMarkdown;
  vm.asPDF        = asPDF;

  function initDownload(action, styled) {

    $downloader[0].action = action;
    $downloader[0].target = $attrs.diTarget;

    $preview.val( $attrs.diTarget === 'preview' );
    $name.val( documentsService.getCurrentDocumentTitle() );
    $unmd.val( documentsService.getCurrentDocumentBody() );
    $formatting.val( styled );

    $downloader.submit();
  }

  function asHTML(styled) {
    if (window.ga) {
      let previewOrExport = ($attrs.diTarget === 'preview') ? 'Preview' : 'Export'
      ga('send', 'event', 'click', styled ? (previewOrExport +' As Styled HTML') : 
        (previewOrExport + ' As Plain HTML'), previewOrExport + ' As...')
    }
    initDownload( 'factory/fetch_html', styled );
  }

  function asStyledHTML() {
    asHTML(true);
  }

  function asMarkdown() {
    if (window.ga) {
      let previewOrExport = ($attrs.diTarget === 'preview') ? 'Preview' : 'Export'
      ga('send', 'event', 'click', previewOrExport + ' As Markdown', previewOrExport + ' As...')
    }
    initDownload( 'factory/fetch_markdown' );
  }

  function asPDF() {
    if (window.ga) {
      let previewOrExport = ($attrs.diTarget === 'preview') ? 'Preview' : 'Export'
      ga('send', 'event', 'click', previewOrExport + ' As PDF', previewOrExport + ' As...')
    }
    initDownload( 'factory/fetch_pdf' );
  }

  $scope.$on('$destroy', function() {
    vm     = null;
    $scope = null;

    return false;
  });

});
