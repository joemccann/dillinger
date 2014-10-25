
'use strict'

module.exports =
  angular
  .module('notification', [])
  .factory 'notificationService',
  ($templateCache, $compile, $timeout, $rootScope) ->

    stack = []

    class Notification
      constructor: (args) ->
        @defaults =
          top: 100
          duration: 3000
          container: document.body
          message: 'Notification'
          template: require 'raw!../base/notification.html'

        if angular.isString(args)
          args =
            message: args
        @args               = angular.extend {}, @defaults, args

        if @args.scope then @args.scope else @args.scope = $rootScope.$new()

        templateElement = $compile(@args.template)(@args.scope)

        @args.scope.$message = args.message


        angular.element(@args.container).append(templateElement)
        stack.push(templateElement)

        $timeout ->
          templateElement.css(
            "margin-left": "-#{templateElement[0].offsetWidth / 2}px"
          )#.addClass('fade')

        @args.scope.$close = ->
          templateElement.attr(
            "data-closing", true
          ).css(
            "opacity": 0
          )#.addClass('out')
          layoutMessage()

        layoutMessage = =>
          j = 0
          currentY = @args.top
          shadowHeight = 50
          for el in stack
            height = el[0].offsetHeight
            top = currentY + height + shadowHeight
            if el.attr('data-closing')
              top += 0
            else
              currentY += height

            el.css(
              "visibility": "visible"
              "top":        "#{top}px"
              "margin-top": "-#{height+shadowHeight}px"
            ).addClass('fade in')

        $timeout ->
          layoutMessage()

        if @args.duration > 0
          $timeout =>
            @args.scope.$close()
          , @args.duration



    return (args) -> new Notification(args)
