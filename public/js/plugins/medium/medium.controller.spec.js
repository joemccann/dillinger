'use strict';

describe('mediumController', function() {

  var
    $controller = null,
    $scope = null,
    $rootScope = null,
    $modal = null,
    mediumService = null,
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
    mediumService = {
      saveFile: function(data) {
        deferred = q.defer();
        deferred.resolve();
        return deferred.promise;
      }
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

  beforeEach(inject(function($controller, $rootScope,  $modal, _mediumService_, _documentsService_, $q) {
    $scope = $rootScope;
    q = $q;

    // Create the controller
    $controller('Medium as vm', {
      $scope: $scope,
      $modal: $modal,
      mediumService: mediumService,
      documentsService: documentsService
    });
  }));

  it('should save the document', function() {
    var saved = $scope.vm.saveTo("dilinger-save");
    $scope.$digest();
    expect(saved.$$state.status).toEqual(1);
  });

});