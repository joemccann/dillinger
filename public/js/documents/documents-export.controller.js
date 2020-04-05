
/* global ga, jQuery */

module.exports =
  angular
    .module('diDocuments.export', [
      'diDocuments.service'
    ])
    .controller('DocumentsExport', ($scope, $attrs, documentsService) => {
      let vm = this
      const $ = jQuery
      const $downloader = $('#downloader')
      const $name = $downloader.find('[name=name]')
      const $unmd = $downloader.find('[name=unmd]')
      const $formatting = $downloader.find('[name=formatting]')
      const $preview = $downloader.find('[name=preview]')
      const initDownload = (action, styled) => {
        $downloader[0].action = action
        $downloader[0].target = $attrs.diTarget

        $preview.val($attrs.diTarget === 'preview')
        $name.val(documentsService.getCurrentDocumentTitle())
        $unmd.val(documentsService.getCurrentDocumentBody())
        $formatting.val(styled)

        $downloader.submit()
      }

      const asHTML = (styled) => {
        if (window.ga) {
          const previewOrExport = ($attrs.diTarget === 'preview')
            ? 'Preview'
            : 'Export'
          ga('send', 'event', 'click', styled
            ? (previewOrExport + ' As Styled HTML')
            : (previewOrExport + ' As Plain HTML'), previewOrExport + ' As...')
        }
        initDownload('factory/fetch_html', styled)
      }

      const asStyledHTML = () => {
        asHTML(true)
      }

      const asMarkdown = () => {
        if (window.ga) {
          const previewOrExport = ($attrs.diTarget === 'preview')
            ? 'Preview' : 'Export'
          ga('send', 'event', 'click', previewOrExport + ' As Markdown',
            previewOrExport + ' As...')
        }
        initDownload('factory/fetch_markdown')
      }

      const asPDF = () => {
        if (window.ga) {
          const previewOrExport = ($attrs.diTarget === 'preview')
            ? 'Preview' : 'Export'
          ga('send', 'event', 'click', previewOrExport + ' As PDF',
            previewOrExport + ' As...')
        }
        initDownload('factory/fetch_pdf')
      }

      vm.asHTML = asHTML
      vm.asStyledHTML = asStyledHTML
      vm.asMarkdown = asMarkdown
      vm.asPDF = asPDF

      $scope.$on('$destroy', () => {
        vm = null
        $scope = null

        return false
      })
    })
