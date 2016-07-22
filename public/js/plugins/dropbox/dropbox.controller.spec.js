'use strict';

require('angular-mocks');

describe('dropboxController', function() {

  var
    $controller = null,
    $scope = null,
    $rootScope = null,
    $modal = null,
    dropboxService = null,
    documentsService = null,
    $httpBackend = null,
    diNotify = null,
    q = null,
    deferred = null;

  var fakeModal = {
    result: {
      then: function() {
        $scope.$emit('document.refresh');
        return $scope.$emit('autosave');
      }
    }
  };

  beforeEach(window.angular.mock.module('Dillinger'));

  beforeEach(inject(function($modal) {
    spyOn($modal, 'open').and.returnValue(fakeModal);
  }));

  beforeEach(function() {
    dropboxService = {
      saveFile: function(data) {
        deferred = q.defer();
        deferred.resolve();
        return deferred.promise;
      },
      fetchFiles: function() {
        var fetchedFile = {
          fetched: {
            fileName: 'dilinger-file.md',
            file: '### Dilinger file content'
          }
        }
        return fetchedFile;
      },
    }
  });

  beforeEach(function() {
    documentsService = {
      getCurrentDocumentTitle: function() {
        return 'Dilinger Test Document Title';
      },
      getCurrentDocumentBody: function() {
        return '### Dilinger file body';
      }
    }
  });

  beforeEach(inject(function($controller, $rootScope,  $modal, _dropboxService_, _documentsService_, $q) {
    $scope = $rootScope;
    q = $q;

    // Create the controller
    $controller('Dropbox as vm', {
      $scope: $scope,
      $modal: $modal,
      dropboxService: dropboxService,
      documentsService: documentsService
    });
  }));

  it('should import the file, refresh and autosave the document', function() {
    spyOn($scope, '$emit');
    $scope.vm.importFile("dilinger-import");
    $scope.$digest();

    expect($scope.$emit).toHaveBeenCalledWith('autosave');
    expect($scope.$emit).toHaveBeenCalledWith('document.refresh');
  });

  it('should save the document', function() {
    var saved = $scope.vm.saveTo("dilinger-save");
    $scope.$digest();
    expect(saved.$$state.status).toEqual(1);
  });

});