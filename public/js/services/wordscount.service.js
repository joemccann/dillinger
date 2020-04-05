
module.exports =
  angular
    .module('diDocuments.service.wordcount', [])
    .factory('wordsCountService', ($rootScope) => {
      let words = 0
      const $preview = angular.element(document).find('#preview')

      const service = {
        count: () => {
          words = countWords(getTextInElement($preview[0]))
          return words
        }
      }

      /// ///////////////////////////

      const countWords = (str) => {
        const wrds = str.replace(/W+/g, ' ').match(/\S+/g)
        return wrds && (wrds.length || 0)
      }

      const getTextInElement = (node) => {
        let txt = null
        if (node.nodeType === 3) {
          return node.data
        }
        txt = ''
        if (node.firstChild) {
          node = node.firstChild
          while (true) {
            txt += getTextInElement(node)
            if (!(node.nextSibling)) {
              break
            }
            node = node.nextSibling
          }
        }
        return txt
      }

      return service
    })
