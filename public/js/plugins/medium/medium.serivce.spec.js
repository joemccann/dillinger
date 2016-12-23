
'use strict';

describe("mediumService", function() {

  var
      service      = null,
      $httpBackend = null,
      diNotify     = null;

  beforeEach(window.angular.mock.module('Dillinger'));

  beforeEach( inject(function(_mediumService_, _$httpBackend_, _diNotify_) {
    service = _mediumService_;
    $httpBackend = _$httpBackend_;
    diNotify = _diNotify_;
  }));

  afterEach(function() {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should save the current file to medium and return success message', function() {

    var markDownDocument = {
      content:   '#Dillinger Test',
      title:   'Medium Dillinger'
    };

    $httpBackend.expectPOST('save/medium').respond(200);

    service.saveFile(markDownDocument);

    $httpBackend.flush();

    var diNotifyElements = document.getElementsByClassName('diNotify-message');
    var diNotifyElementsText = '';
    for (var i= 0; i < diNotifyElements.length; ++i) {
      diNotifyElementsText = diNotifyElementsText + diNotifyElements[i].innerHTML;
    }
    expect(diNotifyElementsText).toContain('Successfully saved to Medium');
  });


});