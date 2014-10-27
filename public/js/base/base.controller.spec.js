
'use strict';
require("../app");

require("angular-mocks");

describe('The BaseController', function() {
  var ctrl, scope;
  ctrl = void 0;
  scope = void 0;
  beforeEach(window.angular.mock.module("Dillinger"));
  return it("should have a default name value", inject(function($controller) {
    scope = {};
    ctrl = $controller("BaseController", {
      $scope: scope
    });
    expect(scope.name).toBe("Document Name");
  }));
});
