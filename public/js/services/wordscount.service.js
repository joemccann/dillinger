
'use strict';
module.exports =
  angular
  .module('diDocuments.service.wordcount', [])
  .service('wordsCountService', function($rootScope) {

  var $preview, countWords, getTextInElement, service, words;

  words = 0;
  $preview = angular.element(document).find('#preview');

  countWords = function(str) {
    var wrds;
    wrds = str.replace(/W+/g, ' ').match(/\S+/g);
    return wrds && wrds.length || 0;
  };

  getTextInElement = function(node) {
    var txt;
    if (node.nodeType === 3) {
      return node.data;
    }
    txt = "";
    if (node = node.firstChild) {
      while (true) {
        txt += getTextInElement(node);
        if (!(node = node.nextSibling)) {
          break;
        }
      }
    }
    return txt;
  };

  service = {
    count: function() {
      return words = countWords(getTextInElement($preview[0]));
    }
  };

  return service;
});
