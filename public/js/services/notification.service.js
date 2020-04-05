
const template = require('../base/diNotify.html')

module.exports =
  angular
    .module('diNotify', [])
    .factory('diNotify', (
      $templateCache,
      $compile,
      $timeout,
      $rootScope) => {
      const stack = []
      const startTop = 100

      const DiNotify = (() => {
        const _doLayout = () => {
          let
            j = 1 // multiplier for stack
          const distance = 50 // distance between notifications
          let currentY = startTop
          const _results = []

          // lets in for loop
          let el; let height; let top; let _i; let _len

          for (_i = 0, _len = stack.length; _i < _len; _i++) {
            el = stack[_i]
            height = el[0].offsetHeight
            top = currentY + height + distance

            // If the element is going to be destroyed
            if (el.attr('data-closing')) {
              top += 0
            } else {
              currentY += height + (20 * j++)
            }

            _results.push(el.css({
              visibility: 'visible',
              top: '' + top + 'px',
              'margin-top': '-' + (height + distance) + 'px'
            }).addClass('fade in'))
          }

          return _results
        }

        const onElementClosing = (e) => {
          // note: "this" refers to the DiNotify constructor here
          if (e.propertyName === 'opacity' ||
          ((e.originalEvent != null) &&
          e.originalEvent.propertyName === 'opacity')) {
            // call destory on element
            return this.$destroy()
          }
        }

        const DiNotify = (args) => {
          this.defaults = {
            top: 100,
            duration: 2000,
            container: document.body,
            message: 'Notification',
            template
          }

          // DiNotify has been called with a string, let's make it an object
          if (angular.isString(args)) {
            args = {
              message: args
            }
          }

          this.args = angular.extend({}, this.defaults, args)
          this.$scope = this.args.scope ? this.args.scope : $rootScope.$new()

          this.$el = null
          this.$scope.$message = args.message

          this.build()
          this.addEvents()
        }

        DiNotify.prototype.build = () => {
          this.$el = $compile(this.args.template)(this.$scope)

          this.$el.bind(
            'webkitTransitionEnd oTransitionEnd otransitionend transitionend',
            onElementClosing.bind(this.$scope)
          )

          angular.element(this.args.container).append(this.$el)

          return stack.push(this.$el)
        }

        DiNotify.prototype.addEvents = () => {
          const self = this

          this.$scope.$on('$destroy', (e) => {
            stack.splice(stack.indexOf(self.$el), 1)
            return self.$el.remove()
          })

          this.$scope.$close = () => {
            self.$el.attr('data-closing', true).css({
              opacity: 0
            })
            return _doLayout()
          }

          $timeout(() => {
            return _doLayout()
          })

          if (this.args.duration > 0) {
            return $timeout(() => {
              return self.$scope.$close()
            }, this.args.duration)
          }
        }

        return DiNotify
      })()

      return (args) => {
        return new DiNotify(args)
      }
    })
