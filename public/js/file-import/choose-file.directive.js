module.exports =
  angular
  .module('diFileImport.directives.choose', [])
  .directive('fileImportChooseFile', function($rootScope, documentsService) {
    var $ = jQuery;

    var directive = {
      restrict: 'A',
      link: function(scope, el, attrs) {
        el.hide();

        $rootScope.$on('importFile.choose', function() {
          // Prevent angular bootstrap menu from tripping
          // over itself in the click handler they bind to
          // the document to close the menu.
          var event = $.Event('click');
          event.stopPropagation();

          el.trigger(event);
        });

        el.change(function() {
          var file = this.files[0];

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
        });
      }
    };

    return directive;
  });
