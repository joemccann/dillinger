
'use strict'

Dillinger = require('../dillinger')

module.exports = Dillinger.service 'Wordcounter',
  ($rootScope) ->

    words = 0
    $preview = angular.element(document).find('#preview')

    countWords = (str) ->
      wrds = str
        .replace(/W+/g, ' ')
        .match(/\S+/g)
      return wrds and wrds.length or 0

    getTextInElement = (node) ->
      return node.data if node.nodeType is 3
      txt = ""
      if node = node.firstChild
        loop
          txt += getTextInElement(node)
          break unless node = node.nextSibling
      txt

    service =
      count: ->
        words = countWords(getTextInElement($preview[0]))

    return service
