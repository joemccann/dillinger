'use strict'; 

module.exports =
angular
.module('diSplitJs.directive', [])
.directive('split-area'), function(){
    var directive; 
    console.log('in split-area directive');
    directive = {
        restrict: 'E',
        replace: true,
        controller: 'diSplitJs',
        template: '<div id="test-directive"><h3>Hello Directive</h3></div>',
       // link: function($scope, $elem, attr){
            
      //  }
    }
    
    return directive; 
}