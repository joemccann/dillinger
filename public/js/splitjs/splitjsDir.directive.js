'use strict'; 

module.exports =
angular
.module('diSplitJsDir.directives', [])
.directive('splitArea', function(){
    var directive; 
    console.log('in split-area directive');
    directive = {
        restrict: 'E',
        replace: true,
        controller: 'diSplitJsCtrl',
        template: '<div id="test-directive"><h3>Hello Directive</h3></div>',
        /*link: function($scope, $elem, attr){
            
        }*/
    }
    
    return directive; 
});