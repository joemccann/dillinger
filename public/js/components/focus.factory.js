'use strict';

module.exports =
  angular
  .module('diBase.factories', [])
  .factory('focus', function($timeout, $window) {
   return function(id) {
     // timeout makes sure that it is invoked after any other event has been triggered.
     // e.g. click events that need to run before the focus or
     // inputs elements that are in a disabled state but are enabled when those events
     // are triggered.
     $timeout(function() {
       var element = $window.document.getElementById(id);
       if(element) {
         element.focus();
       }
     });
   };
 });
