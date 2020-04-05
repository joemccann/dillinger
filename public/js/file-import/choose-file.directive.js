
/* global jQuery */

module.exports =
  angular
    .module('diFileImport.directives.choose', [])
    .directive('fileImportChooseFile', ($rootScope, documentsService) => {
      const $ = jQuery

      const directive = {
        restrict: 'A',
        link: function (scope, el, attrs) {
          el.hide()

          let isHtmlFlagSet = false

          $rootScope.$on('importFile.choose', (event, args) => {
          // Prevent angular bootstrap menu from tripping
          // over itself in the click handler they bind to
          // the document to close the menu.
            const jQEvent = $.Event('click')

            // Hacky way of importing HTML file check; not recommended
            if (args && args.isHtml) isHtmlFlagSet = true

            jQEvent.stopPropagation()

            el.trigger(jQEvent)
          })

          el.change((e) => {
            const file = this.files[0]
            // Is it a markdown file or html file?
            documentsService.importFile(file, true, isHtmlFlagSet)
            isHtmlFlagSet = false

            // Reset to clear the FileList, which is read-only
            this.value = ''
          })
        }
      }

      return directive
    })
