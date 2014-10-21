
Dillinger = require('../dillinger')

Doc = Dillinger.factory 'Doc',
  () ->

    'use strict'

    model = (data) ->
      angular.extend @,
        id: new Date().getTime()
        title: "Untitled Document"
        body: require("raw!./defaultText.md")
      angular.extend @, data
    return model

module.exports = Doc
