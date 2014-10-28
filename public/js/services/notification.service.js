
'use strict';
module.exports =
  angular
  .module('diNotify', [])
  .factory('diNotify', function($templateCache, $compile, $timeout, $rootScope) {

  var diNotify, stack, startTop;

  stack = [];
  startTop = 100;

  diNotify = (function() {
    var onElementClosing, _doLayout;

    _doLayout = function() {
      var currentY, el, height, j, shadowHeight, top, _i, _len, _results;
      j = 1;
      shadowHeight = 50;
      currentY = startTop;
      _results = [];
      for (_i = 0, _len = stack.length; _i < _len; _i++) {
        el = stack[_i];
        height = el[0].offsetHeight;
        top = currentY + height + shadowHeight;
        if (el.attr('data-closing')) {
          top += 0;
        } else {
          currentY += height + (20 * j++);
        }
        _results.push(el.css({
          "visibility": "visible",
          "top": "" + top + "px",
          "margin-top": "-" + (height + shadowHeight) + "px"
        }).addClass('fade in'));
      }
      return _results;
    };

    onElementClosing = function(e) {
      if (e.propertyName === 'opacity' || (e.originalEvent != null) && e.originalEvent.propertyName === 'opacity') {
        return this.$destroy();
      }
    };

    function diNotify(args) {

      this.defaults = {
        top: 100,
        duration: 2000,
        container: document.body,
        message: 'Notification',
        template: require('raw!../base/diNotify.html')
      };

      if (angular.isString(args)) {
        args = {
          message: args
        };
      }

      this.args = angular.extend({}, this.defaults, args);
      this.$scope = this.args.scope ? this.args.scope : $rootScope.$new();

      this.$el = void 0;
      this.$scope.$message = args.message;

      this.build();
      this.addEvents();
    }

    diNotify.prototype.build = function() {
      this.$el = $compile(this.args.template)(this.$scope);
      this.$el.bind('webkitTransitionEnd oTransitionEnd otransitionend transitionend', onElementClosing.bind(this.$scope));
      angular.element(this.args.container).append(this.$el);
      return stack.push(this.$el);
    };

    diNotify.prototype.addEvents = function() {
      var self;
      self = this;

      this.$scope.$on('$destroy', function(e) {
        stack.splice(stack.indexOf(self.$el), 1);
        return self.$el.remove();
      });

      this.$scope.$close = function() {
        self.$el.attr("data-closing", true).css({
          "opacity": 0
        });
        return _doLayout();
      };

      $timeout(function() {
        return _doLayout();
      });

      if (this.args.duration > 0) {
        return $timeout(function() {
          return self.$scope.$close();
        }, this.args.duration);
      }
    };

    return diNotify;

  })();

  return function(args) {
    return new diNotify(args);
  };
});
