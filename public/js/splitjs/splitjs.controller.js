'use strict'; 
var Split = require('split.js'); 
module.exports = 
  angular
  .module('diSplitJs',['diSplitJsDir.directives'])
  .controller('diSplitJsCtrl', function($rootScope){
    /* console.log('hit');
     
     // var editor = angular.element(document.querySelector('#editor')).attr('id'); 
     // var preview = angular.element(document.querySelector('#preview')).attr('id');
      
      var editorElem = document.querySelector('#editor1');
      //var previewElem = document.querySelector('#preview1');
      
      console.log(editorElem.parentNode.className); 
      console.log(editorElem.parentNode.id);
      console.log(editorElem.id); 
      console.log(document.querySelector('#test-directive')); 
      //common parent does not have an id only class
      //g-b g-b--t1of2 split split-editor
      
      var editor = angular.element(editorElem).attr('id');
      //var preview = angular.element(previewElem).attr('id'); 
      
      
      //var editorElementID = '#'+editor; 
      //var previewElementID = '#'+preview; 
      //alert('#' + editor); 
      
     /* $scope.editor = editor; 
      $scope.preview = preview;*/
      
   /*   Split(['#editor1', '#preview1'],{
          sizes: [50,50],
          minSize: 200 
      }); 
      */
  });