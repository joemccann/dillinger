module.exports =
  angular
    .module('diFileImport.directives.dnd', [])
    .directive('fileImportDropTarget', (documentsService) => {
      const createDropTarget = (scope, el, attrs) => {
        el.on({
          dragover: (e) => {
            // Gives the user visual feedback by changing the
            // cursor to copy (usually a triangle with a plus sign).
            e.originalEvent.dataTransfer.dropEffect = 'copy'
            preventDefault(e)
          },
          drop: (event) => {
            preventDefault(event)

            const file = event.originalEvent.dataTransfer.files[0]
            // Check here for HTML or MD
            const isHTML = file.type === 'text/html'
            documentsService.importFile(file, false, isHTML)
          }
        })

        function preventDefault (event) {
          event.preventDefault()
        }
      }

      const directive = {
        restrict: 'A',
        link: createDropTarget
      }

      return directive
    })
