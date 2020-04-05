
'use strict'
module.exports =
  angular
    .module('diDebounce.service', [])
    .factory('debounce', ($timeout) => {
      return (cb, delay) => {
        let timer = null

        return function () {
          const context = this
          const args = arguments

          // create a function that will clear the timer and call
          // the original callback function
          const later = function () {
            timer = null
            cb.apply(context, args)
          }

          $timeout.cancel(timer)
          timer = $timeout(later, delay)
        }
      }
    })
