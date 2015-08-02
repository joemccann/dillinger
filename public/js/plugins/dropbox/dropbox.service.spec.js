
'use strict';

describe('dropboxService', function() {

  var
    service      = null,
    $httpBackend = null,
    diNotify     = null;

  beforeEach(window.angular.mock.module('Dillinger'));

  beforeEach( inject(function(_dropboxService_, _$httpBackend_, _diNotify_) {
    service = _dropboxService_;
    $httpBackend = _$httpBackend_;
    diNotify = _diNotify_;
  }));

  afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });

  it('should fetch files from dropbox and set it on the service.files variable', function() {

    $httpBackend.when('POST' ,'import/dropbox', {
      fileExts: 'md'
    }).respond([1,2,3]);

    service.fetchFiles().success(function(data) {
      expect(service.files).toEqual([1,2,3]);
    });

    $httpBackend.flush();
  });

  it('should fetch a file from dropbox and set it on the service.fetched.file variable', function() {

    var filePath = 'path/to/file.md';

    $httpBackend.expectPOST('fetch/dropbox', {
      mdFile: filePath
    }).respond({ data: [1,2,3] });

    service.fetchFile(filePath).success(function(data) {
      expect(service.fetched.file).toEqual([1,2,3]);
    });

    $httpBackend.flush();
  });

});
