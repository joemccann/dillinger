'use strict';

module.exports =
  angular
  .module('diBase.directives.fileDropTarget', [])
  .directive('fileDropTarget', function(documentsService) {

  function createDropTarget(scope, el, attrs) {
    el.on({
      'dragover dragend': preventDefault,
      'drop': function(event) {
        preventDefault(event);

        var file = event.originalEvent.dataTransfer.files[0];
        readFile(file);
      }
    });

    function readFile(file) {
      var reader = new FileReader();
      reader.onload = function(event) {
        // Create a new document.
        var item = documentsService.createItem();
        documentsService.addItem(item);
        documentsService.setCurrentDocument(item);

        // Set the new documents title and body.
        documentsService.setCurrentDocumentTitle(file.name);
        documentsService.setCurrentDocumentBody(event.target.result);

        // Refresh the editor and proview.
        scope.$emit('document.refresh');
      };

      reader.readAsText(file);
    }

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
