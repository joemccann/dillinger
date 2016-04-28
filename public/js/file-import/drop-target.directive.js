'use strict';

module.exports =
  angular
  .module('diFileImport.directives.dnd', [])
  .directive('fileImportDropTarget', function(documentsService) {

  function createDropTarget(scope, el, attrs) {
    el.on({
      'dragover dragend': preventDefault,
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
