'use strict';

describe("githubController", function() {

  var
    $controller = null,
    $scope = null,
    $rootScope = null,
    $modal = null,
    githubService = null,
    documentsService = null,
    $httpBackend = null,
    diNotify = null,
    q = null,
    deferred = null;

  var fakeData = {
    data : {
      content: {
        sha: "2teste1c67a2d28fced849ee1bb76e7391b93eb12"
      }
    }
  };

  var fakeModal = {
    result: {
      then: function() {
        $scope.$emit('document.refresh');
        return $scope.$emit('autosave');
      }
    }
  };

  beforeEach(window.angular.mock.module('Dillinger'));

  beforeEach(function() {
    documentsService = {
      getCurrentDocument: function() {
        var item = {
          id: '123',
          title: 'Github Controller Test Title',
          body: 'Github Controller Test Body',
          isGithubFile: true,
          github: {
            path: '/dillinger/testpath.md'
          }
        };
        return item;
      },
      setCurrentDocumentSHA: function() {
        var sha = "2fd4e1c67a2d28fced849ee1bb76e7391b93eb12";
        return sha;
      },
      createItem: function(data) {
      },
      addItem: function(file) {
      },
      setCurrentDocument: function(file) {
      }
    }
  });

  beforeEach(function() {
    githubService = {
      saveToGithub: function(data) {
        deferred = q.defer();
        deferred.resolve(fakeData);
        return deferred.promise;
      },
      config: {
        user: {
          name: {}
        },
        orgs: "dillinger-orgs"
      },
      registerUserAsOrg: {
      },
      fetchOrgs: function() {
        deferred = q.defer();
        deferred.resolve('org registered');
        return deferred.promise;
      }
    }
  });

  beforeEach(inject(function($modal) {
    spyOn($modal, 'open').and.returnValue(fakeModal);
  }));

  beforeEach(inject(function($controller, $rootScope,  $modal, _githubService_, _documentsService_, _diNotify_, $q) {
    $scope = $rootScope;
    q = $q;

    // Create the controller
    $controller('Github as vm', {
      $scope: $scope,
      $modal: $modal,
      githubService: githubService,
      documentsService: documentsService,
      diNotify: diNotify
    });
  }));

  it('should import the file, refresh and autosave the document', function() {
    spyOn($scope, '$emit');
    $scope.vm.importFile("dillinger-import");
    $scope.$digest();

    expect($scope.$emit).toHaveBeenCalledWith('autosave');
    expect($scope.$emit).toHaveBeenCalledWith('document.refresh');
  });

  it('should save, refresh and autosave the document', function() {
    spyOn($scope, '$emit');
    $scope.vm.saveTo("dillinger-save");
    $scope.$digest();

    expect($scope.$emit).toHaveBeenCalledWith('autosave');
    expect($scope.$emit).toHaveBeenCalledWith('document.refresh');
  });

});