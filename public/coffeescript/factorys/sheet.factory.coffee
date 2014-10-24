
'use strict'

module.exports =
  angular
  .module('documents.sheet', [])
  .factory 'Sheet',
  () ->
    (sheetData) ->
      angular.extend @,
        id: new Date().getTime()
        title: 'Untitled Document'
        body: require('raw!../../../README.md')
      angular.extend @, sheetData
