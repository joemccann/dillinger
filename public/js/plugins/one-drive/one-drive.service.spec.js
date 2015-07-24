
"use strict";

describe("onedriveService", function() {
  var
    service      = null,
    $httpBackend = null,
    diNotify     = null;



  beforeEach(window.angular.mock.module('Dillinger'));

  beforeEach( inject(function(_onedriveService_, _$httpBackend_, _diNotify_) {
    service = _onedriveService_;
    $httpBackend = _$httpBackend_;
    diNotify = _diNotify_;
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should fetch files from onedrive and set it on the service.files variable', function() {

    $httpBackend.whenGET('import/onedrive').respond({ data: [1,2,3] });

    service.fetchFiles().success(function(data) {
      expect(service.files).toEqual([1,2,3]);
    });

    $httpBackend.flush();
  });


  it('should fetch a file from onedrive and set it on the service.fetched.file variable', function() {

    var fileId = '1';

    $httpBackend.whenGET('fetch/onedrive?fileId=1').respond({ content: '#Dillinger Test Content' });

    service.fetchFile(fileId).success(function(data) {
      expect(service.fetched.file).toEqual('#Dillinger Test Content');
    });

    $httpBackend.flush();
  });

  it('should save the current file on onedrive and return success message', function() {

    var markDownDocument = {
      title:  'TestDocument',
      body:   '#Dillinger Test'
    };

    $httpBackend.expectPOST('save/onedrive').respond({ content: 'dillinger test'});

    service.saveFile(markDownDocument.title, markDownDocument.body);

    $httpBackend.flush();

    var diNotifyElements = angular.element(document.getElementsByClassName('diNotify-message'));
    expect(diNotifyElements.text()).toContain('Successfully saved File to One Drive');
  });

});