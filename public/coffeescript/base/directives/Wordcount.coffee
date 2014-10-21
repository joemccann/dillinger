
Dillinger = require('../../dillinger')

wordcount = Dillinger.directive 'wordcount',
  ($rootScope) ->

    directive =
      link: (scope, el, attrs) ->

        $preview = angular.element(document).find('#preview')

        countWords = (str) ->
          words = str
            .replace(/W+/g, ' ')
            .match(/\S+/g)
          return words and words.length or 0

        getTextInElement = (node) ->
          return node.data if node.nodeType is 3
          txt = ""
          if node = node.firstChild
            loop
              txt += getTextInElement(node)
              break unless node = node.nextSibling
          txt

        scope.refreshWordCount = ->
          console.log "wordcount.refreshWordCount"
          el.text(countWords(getTextInElement($preview[0])))

        $rootScope.editor.on 'change', scope.refreshWordCount
        scope.$on 'wordcount.refresh', scope.refreshWordCount

    return directive

module.exports = wordcount
