'use strict';
module.exports =
  angular
  .module('diDocuments.service.wordcount', [])
  .factory('wordsCountService', function($rootScope) {

  var readingTime = require('reading-time');

  var
    words    = 0,
    time     = '',
    $preview = angular.element(document).find('#preview'),
    text     = getTextInElement($preview[0]),

    service = {
      count: function() {
        var stat = readingTime(text);
        words = stat.words;
        time = stat.text;
        return { wordCount: words, readingTime: time, characterCount: text.length };
      }
    };

  //////////////////////////////

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
