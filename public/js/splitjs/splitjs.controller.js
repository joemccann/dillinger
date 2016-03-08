'use strict'; 

module.exports = 
  angular
  .module('diSplitJs')
  .controller('diSplitJs', function($rootScope, $compile){
     var Split = require('split'); 
      var editor = angular.element(document.querySelector('#editor')); 
      var preview = angular.element(document.querySelector('#preview'));
      
      Split([editor, preview],{
          sizes: [50,50],
          minSize: 200
      }); 
  });