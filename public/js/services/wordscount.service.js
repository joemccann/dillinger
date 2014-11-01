
'use strict';
module.exports =
  angular
  .module('diDocuments.service.wordcount', [])
  .factory('wordsCountService', function($rootScope) {

  var
    words    = 0,
    $preview = angular.element(document).find('#preview'),

    service = {
      count: function() {
        words = countWords(getTextInElement($preview[0]));
        return words;
      }
    };

  //////////////////////////////

  function countWords(str) {
    var wrds;
    wrds = str.replace(/W+/g, ' ').match(/\S+/g);
    return wrds && wrds.length || 0;
  }

  function getTextInElement(node) {
    var txt;
    if (node.nodeType === 3) {
      return node.data;
    }
    txt = '';
    if (node.firstChild) {
      node = node.firstChild;
      while (true) {
        txt += getTextInElement(node);
        if (!(node.nextSibling)) {
          break;
        }
        node = node.nextSibling;
      }
    }
    return txt;
  }

  return service;
});
