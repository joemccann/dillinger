
'use strict';
module.exports = angular.module('diDocuments.sheet', []).factory('Sheet', function() {
  return function(sheetData) {
    angular.extend(this, {
      id: new Date().getTime(),
      title: 'Untitled Document.md',
      body: require('raw!../../../README.md')
    });
    return angular.extend(this, sheetData);
  };
});
