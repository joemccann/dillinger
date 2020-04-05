
const template = require('../documents/delete-modal.directive.html')

module.exports =
  angular
    .module('diDocuments', [
      'diDocuments.service',
      'diDocuments.export',
      'diDocuments.controllers',
      'diDocuments.service.wordcount',
      'diDocuments.service.charactercount'
    ])
    .controller('Documents', (
      $scope,
      $timeout,
      $rootScope,
      $modal,
      userService,
      documentsService,
      debounce,
      wordsCountService,
      charactersCountService) => {
      let vm = this

      vm.status = {
        import: true,
        save: true,
        linkUnlink: true,
        document: false
      }

      const save = (manuel) => {
        const item = documentsService.getCurrentDocument()
        item.body = $rootScope.editor.getSession().getValue()

        documentsService.setCurrentDocument(item)

        return documentsService.save(manuel)
      }

      const initDocument = () => {
        const item = documentsService.getItemById($rootScope.currentDocument.id)
        documentsService.setCurrentDocument(item)

        return $rootScope.$emit('document.refresh')
      }

      const selectDocument = (item) => {
        item = documentsService.getItem(item)
        documentsService.setCurrentDocument(item)

        return $rootScope.$emit('document.refresh')
      }

      const removeDocument = (item) => {
        const modalScope = $rootScope.$new()
        modalScope.item = item
        modalScope.wordCount = wordsCountService.count()
        modalScope.characterCount = charactersCountService.count()

        $modal.open({
          template,
          scope: modalScope,
          controller: 'DeleteDialog',
          windowClass: 'modal--dillinger'
        })
      }

      const createDocument = () => {
        const item = documentsService.createItem()

        documentsService.addItem(item)
        documentsService.setCurrentDocument(item)

        return $rootScope.$emit('document.refresh')
      }

      const doAutoSave = () => {
        if ($scope.profile.enableAutoSave) {
          return save()
        }

        return false
      }

      $scope.profile = userService.profile
      $scope.saveDocument = save
      $scope.createDocument = createDocument
      $scope.removeDocument = removeDocument
      $scope.selectDocument = selectDocument

      $rootScope.documents = documentsService.getItems()

      $rootScope.editor.on('change', debounce(doAutoSave, 2000))
      $rootScope.$on('autosave', doAutoSave)

      $scope.$on('$destroy', () => {
        vm = null
        $scope = null

        return false
      })

      initDocument()
    })
