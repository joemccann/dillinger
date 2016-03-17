'use strict'; 

module.exports =
angular
.module('diSplitJs.directives', [])
.directive('split-area'), function(){
    var directive; 
    
    directive = {
        restrict: 'E',
        replace: true,
        controller: 'diSplitJs',
        template: '<div><h3>{{foo}}</h3></div>',
        link: function(scope, elem, attr){
            
        }
    }
    
    return directive; 
}