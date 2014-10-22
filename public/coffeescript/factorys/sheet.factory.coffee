
'use strict'

app = require('../dillinger')

module.exports = app.factory 'Sheet',
  () ->
    (sheetData) ->
      angular.extend @,
        id: new Date().getTime()
        title: 'Untitled Document'
        body: require('raw!./defaultText.md')
      angular.extend @, sheetData
