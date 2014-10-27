
'use strict';
module.exports = angular.module('diDocuments', ['diDocuments.service', 'diDocuments.export']).controller('Documents', function($scope, $timeout, $rootScope, userService, documentsService) {
  var createDocument, doAutoSave, initDocument, removeDocument, save, selectDocument, vm;
  vm = this;
  $scope.profile = userService.profile;
  vm.status = {
    "import": true,
    save: true,
    document: false
  };
  vm.toggled = function(open) {
    return console.log(open);
  };
  $rootScope.documents = documentsService.getItems();
  save = function(manuel) {
    var item;
    item = documentsService.getCurrentDocument();
    item.body = $rootScope.editor.getSession().getValue();
    documentsService.setCurrentDocument(item);
    return documentsService.save(manuel);
  };
  initDocument = function() {
    var item;
    item = documentsService.getItemById($rootScope.currentDocument.id);
    documentsService.setCurrentDocument(item);
    return $rootScope.$emit('document.refresh');
  };
  selectDocument = function(item) {
    item = documentsService.getItem(item);
    documentsService.setCurrentDocument(item);
    return $rootScope.$emit('document.refresh');
  };
  removeDocument = function(item) {
    var next;
    documentsService.removeItem(item);
    next = documentsService.getItemByIndex(0);
    documentsService.setCurrentDocument(next);
    return $rootScope.$emit('document.refresh');
  };
  createDocument = function() {
    var item;
    item = documentsService.createItem();
    documentsService.addItem(item);
    documentsService.setCurrentDocument(item);
    return $rootScope.$emit('document.refresh');
  };
  doAutoSave = function() {
    if ($scope.profile.enableAutoSave) {
      return save();
    }
  };
  $scope.$on('$destroy', function() {
    console.log("$destroy");
    vm = null;
    return $scope = null;
  });
  $scope.saveDocument = save;
  $scope.createDocument = createDocument;
  $scope.removeDocument = removeDocument;
  $scope.selectDocument = selectDocument;
  $rootScope.editor.on('change', doAutoSave);
  $rootScope.$on('autosave', doAutoSave);
  initDocument();
});
