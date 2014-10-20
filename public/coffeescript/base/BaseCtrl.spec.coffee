'use strict'

require "../app"
require "angular-mocks"

describe 'The BaseController', ->

  ctrl = undefined
  scope = undefined

  beforeEach(window.angular.mock.module("Dillinger"))

  it "should have a default name value", inject(($controller) ->
    scope = {}
    ctrl = $controller("BaseController",
      $scope: scope
    )
    expect(scope.name).toBe "Document Name"
    return
  )
