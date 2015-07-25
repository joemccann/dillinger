
'use strict';

describe("googledriveService", function() {

  var
      service      = null,
      $httpBackend = null,
      diNotify     = null;

  beforeEach(window.angular.mock.module('Dillinger'));

  beforeEach( inject(function(_googledriveService_, _$httpBackend_, _diNotify_) {
    service = _googledriveService_;
    $httpBackend = _$httpBackend_;
    diNotify = _diNotify_;
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should fetch files from googledrive and set it on the service.files variable', function() {

    $httpBackend.whenGET('import/googledrive').respond({ items: [1,2,3] });

    service.fetchFiles().success(function(data) {
      expect(service.files).toEqual([1,2,3]);
    });

    $httpBackend.flush();
  });

  it('should fetch a file from googledrive and set it on the service.fetched.file variable', function() {

    var fileId = '1';

    $httpBackend.whenGET('fetch/googledrive?fileId=1').respond({ content: '#Dillinger Test Content' });

    service.fetchFile(fileId).success(function(data) {
      expect(service.fetched.file).toEqual('#Dillinger Test Content');
    });

    $httpBackend.flush();
  });

  it('should save the current file on googledrive and return success message', function() {

    var markDownDocument = {
      title:  'TestDocument',
      body:   '#Dillinger Test'
    };

    $httpBackend.expectPOST('save/googledrive').respond();

    service.saveFile(markDownDocument.title, markDownDocument.body);

    $httpBackend.flush();

    var diNotifyElements = document.getElementsByClassName('diNotify-message');
    var diNotifyElementsText = '';
    for (var i= 0; i < diNotifyElements.length; ++i) {
      diNotifyElementsText = diNotifyElementsText + diNotifyElements[i].innerHTML;
    }
    expect(diNotifyElementsText).toContain('Successfully saved to Google Drive');
  });

});