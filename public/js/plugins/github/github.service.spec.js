
'use strict';

describe("githubService", function() {

  var
      service      = null,
      $httpBackend = null,
      diNotify     = null;


  beforeEach(window.angular.mock.module('Dillinger'));

  beforeEach( inject(function(_githubService_, _$httpBackend_, _diNotify_) {
    service = _githubService_;
    $httpBackend = _$httpBackend_;
    diNotify = _diNotify_;
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should fetch a file from github and set it on the service.fetched.file variable', function() {

    var markDownFile = {
      url:  'www.dilingertest.com/url',
      path:   'dilinger/test.md'
    };

    $httpBackend.expectPOST('import/github/file').
      respond({
          data: {
            content: 'dilinger test content',
            url: markDownFile.url,
            sha: 'dsdfagdsaggas3432sdt34ggagg'
          }
        });

    service.fetchFile(markDownFile.url, markDownFile.path).success(function(data) {

      expect(service.config.current.url).toEqual(markDownFile.url);
    });

    $httpBackend.flush();
  });


  it('should save the current file to github and return success message', function() {

    var markDownDocument = {
      uri:  'https://github.com/testbranch/TestDocument.md',
      data:   '#Dillinger Test',
      path:    'test/path',
      sha:     'dsdfagdsaggas3432sdt34ggagg',
      branch:  'testbranch',
      repo:    'testrepo',
      message: 'testmessage',
      owner:   'dilinger'
    };

    $httpBackend.expectPOST('save/github').respond({ content: { path: markDownDocument.path }});

    service.saveToGithub(markDownDocument);

    $httpBackend.flush();

    var diNotifyElements = angular.element(document.getElementsByClassName('diNotify-message'));
    expect(diNotifyElements.text()).toContain('Successfully saved to ' + markDownDocument.path);
  });


});