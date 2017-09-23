
'use strict';
module.exports =
  angular
  .module('diDocuments.service.charactercount', [])
  .factory('charactersCountService', function($rootScope) {

  var
    characters = 0,
    $preview   = angular.element(document).find('#preview'),

    service = {
      count: function() {
        characters = countCharacters(getTextInElement($preview[0]));
        return characters;
      }
    };

  //////////////////////////////

  function countCharacters(str) {
    var chrcs;
    chrcs = str.length;
    return chrcs;
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
