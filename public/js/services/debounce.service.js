
'use strict';
module.exports =
  angular
  .module('diDebounce.service', [])
  .factory('debounce', function($timeout) {

    return debounce;

    function debounce(cb, delay) {
      var timer;

      return function() {
        var context = this;
        var args = arguments;

        // create a function that will clear the timer and call
        // the original callback function
        var later = function() {
          timer = null;
          cb.apply(context, args);
        };

        $timeout.cancel(timer);
        timer = $timeout(later, delay);
      };
    }

  });
