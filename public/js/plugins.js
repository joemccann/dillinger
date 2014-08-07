var Plugins = (function() {
  var store = []
  return {

    register: function(plug) {
      store.push(plug)
    },
    forEach: function(fn) {
      store.forEach(fn)
    }

  }
})() // end IIFE
