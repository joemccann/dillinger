'use strict';

module.exports =
  angular
  .module('diFileImport.directives.dnd', [])
  .directive('fileImportDropTarget', function(documentsService) {

  function createDropTarget(scope, el, attrs) {
    el.on({
      'dragover': function(e) {
        // Gives the user visual feedback by changing the
        // cursor to copy (usually a triangle with a plus sign).
        e.originalEvent.dataTransfer.dropEffect = 'copy';
        preventDefault(e);
      },
      'drop': function(event) {
        preventDefault(event);

        var file = event.originalEvent.dataTransfer.files[0];
        documentsService.importFile(file);
      }
    });

    function preventDefault(event) {
      event.preventDefault();
    }
  }

  var directive = {
    restrict: 'A',
    link: createDropTarget
  };

  return directive;
});
