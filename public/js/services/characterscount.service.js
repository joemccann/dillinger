
'use strict'
module.exports =
  angular
    .module('diDocuments.service.charactercount', [])
    .factory('charactersCountService', ($rootScope) => {
      const $preview = angular.element(document).find('#preview')

      const service = {
        count: () => countCharacters(getTextInElement($preview[0]))
      }

      /// ///////////////////////////

      const countCharacters = (str) => {
        return str.length
      }

      const getTextInElement = (node) => {
        let txt = ''
        if (node.nodeType === 3) {
          return node.data
        }
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
