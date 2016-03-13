'use strict'; 
var Split = require('split.js'); 
module.exports = 
  angular
  .module('diSplitJs',[])
  .controller('diSplitJs', function($scope){
     alert('wtf');
     
      var editor = angular.element(document.querySelector('#editor')); 
      var preview = angular.element(document.querySelector('#preview'));
      
      $scope.editor = editor; 
      $scope.preview = preview; 
      
      Split([editor, preview],{
          sizes: [50,50],
          minSize: 200
      }); 
  });