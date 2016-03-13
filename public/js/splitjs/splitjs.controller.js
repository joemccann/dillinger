'use strict'; 
 
module.exports = 
  angular
  .module('diSplitJs')
  .controller('diSplitJs', function($scope){
     alert('wtf');
     var Split = require('./split'); 
      var editor = angular.element(document.querySelector('#editor')); 
      var preview = angular.element(document.querySelector('#preview'));
      
      $scope.editor = editor; 
      $scope.preview = preview; 
      
     $scope.Split([editor, preview],{
          sizes: [50,50],
          minSize: 200
      }); 
  });