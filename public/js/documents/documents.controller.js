
'use strict';
module.exports =
  angular
  .module('diDocuments', [
    'diDocuments.service',
    'diDocuments.export',
    'diDocuments.controllers',
    'diDocuments.service.wordcount',
    'diDocuments.service.charactercount'
  ])
  .controller('Documents', function($scope, $timeout, $rootScope, $modal, userService, documentsService, debounce, wordsCountService, charactersCountService) {

  var vm = this;

  vm.status = {
    import:     true,
    save:       true,
    linkUnlink: true,
    document:   false
  };

  $scope.profile        = userService.profile;
  $scope.saveDocument   = save;
  $scope.createDocument = createDocument;
  $scope.removeDocument = removeDocument;
  $scope.selectDocument = selectDocument;

  $rootScope.documents = documentsService.getItems();

  $rootScope.editor.on('change', debounce(doAutoSave, 2000));
  $rootScope.$on('autosave', doAutoSave);

  function save(manuel) {
    var item;

    item      = documentsService.getCurrentDocument();
    item.body = $rootScope.editor.getSession().getValue();

    documentsService.setCurrentDocument(item);

    return documentsService.save(manuel);
  }

  function initDocument() {
    var item;

    item = documentsService.getItemById($rootScope.currentDocument.id);
    documentsService.setCurrentDocument(item);

    return $rootScope.$emit('document.refresh');
  }

  function selectDocument(item) {
    item = documentsService.getItem(item);
    documentsService.setCurrentDocument(item);

    return $rootScope.$emit('document.refresh');
  }

  function removeDocument(item) {
    var modalScope = $rootScope.$new();
    modalScope.item = item;
    modalScope.wordCount = wordsCountService.count();
    modalScope.characterCount = charactersCountService.count();

    $modal.open({
      template: require('raw!../documents/delete-modal.directive.html'),
      scope: modalScope,
      controller: 'DeleteDialog',
      windowClass: 'modal--dillinger'
    });
  }

  function createDocument() {
    var item;

    item = documentsService.createItem();

    documentsService.addItem(item);
    documentsService.setCurrentDocument(item);

    return $rootScope.$emit('document.refresh');
  }

  function doAutoSave() {
    if ($scope.profile.enableAutoSave) {
      return save();
    }

    return false;
  }

  $scope.$on('$destroy', function() {
    vm     = null;
    $scope = null;

    return false;
  });

  initDocument();

});
