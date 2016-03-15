'use strict'; 
var Split = require('split.js'); 
module.exports = 
  angular
  .module('diSplitJs',[])
  .controller('diSplitJs', function($scope){
     alert('wtf');
     
     // var editor = angular.element(document.querySelector('#editor')).attr('id'); 
     // var preview = angular.element(document.querySelector('#preview')).attr('id');
      
      var editorElem = document.querySelector('#editor1');
      var previewElem = document.querySelector('#preview1');
      
      alert(editorElem.parentNode.className); 
      alert(editorElem.parentNode.id);
      
      //common parent does not have an id only class
      //g-b g-b--t1of2 split split-editor
      
      var editor = angular.element(editorElem).attr('id');
      //var preview = angular.element(previewElem).attr('id'); 
      
      
      //var editorElementID = '#'+editor; 
      //var previewElementID = '#'+preview; 
      //alert('#' + editor); 
      
      $scope.editor = editor; 
      $scope.preview = preview;
      
      Split(['#editor1', '#preview1'],{
          sizes: [50,50],
          minSize: 200
      }); 
  });