
'use strict'

module.exports =
  angular
  .module('diNotify', [])
  .factory 'diNotify',
  ($templateCache, $compile, $timeout, $rootScope) ->

    stack    = []
    startTop = 100

    class diNotify

      _doLayout = ->
        j = 1
        shadowHeight = 50
        currentY     = startTop

        for el in stack
          height = el[0].offsetHeight
          top = currentY + height + shadowHeight
          if el.attr('data-closing')
            top += 0
          else
            currentY += height + (20 * j++)
          el.css(
            "visibility": "visible"
            "top":        "#{top}px"
            "margin-top": "-#{height+shadowHeight}px"
          ).addClass('fade in')

      onElementClosing = (e) ->
        if e.propertyName is 'opacity' or e.originalEvent? and e.originalEvent.propertyName is 'opacity'
          @.$destroy()

      constructor: (args) ->
        @defaults =
          top:       100
          duration:  1000
          container: document.body
          message:   'Notification'
          template:  require 'raw!../base/diNotify.html'

        if angular.isString(args)
          args = message: args

        @args = angular.extend {}, @defaults, args

        @$scope = if @args.scope then @args.scope else $rootScope.$new()
        @$el    = undefined

        @$scope.$message = args.message

        @build()
        @addEvents()

      build: ->

        @$el = $compile(@args.template)(@$scope)

        @$el.bind 'webkitTransitionEnd oTransitionEnd otransitionend transitionend', onElementClosing.bind(@$scope)

        angular.element(@args.container).append(@$el)
        stack.push(@$el)

      addEvents: ->
        self = @

        @$scope.$on '$destroy', (e) ->
          stack.splice(stack.indexOf(self.$el), 1)
          self.$el.remove()
          console.log e

        # $timeout ->
        #   self.$el.css(
        #     "margin-left": "-#{self.$el[0].offsetWidth / 2}px"
        #   )#.addClass('fade')

        @$scope.$close = ->
          self.$el.attr(
            "data-closing", true
          ).css(
            "opacity": 0
          )#.addClass('out')
          _doLayout()

        $timeout ->
          _doLayout()

        if @args.duration > 0
          $timeout ->
            self.$scope.$close()
          , @args.duration

    return (args) -> new diNotify(args)
