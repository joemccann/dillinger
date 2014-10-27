
'use strict'

module.exports =
  angular
  .module('diZenMode', ['diZenMode.directives'])
  .controller 'diZenMode',
  ($rootScope, $compile, documentsService) ->

    vm = @

    vm.isZen   = false
    vm.zen     = null

    template = require 'raw!./zen-mode.directive.html'

    vm.toggle = ->
      vm.isZen = !vm.isZen

      if vm.isZen is true

        scope = $rootScope.$new()
        el = $compile(template)(scope)
        angular.element(document.body).append(el)

        scope.$close = ->
          documentsService.setCurrentDocumentBody(vm.zen.getSession().getValue())
          vm.isZen = !vm.isZen
          $rootScope.$emit 'document.refresh'
          el.remove()
          scope.$destroy()
          false

        vm.zen = ace.edit 'zen'
        vm.zen.getSession().setMode('ace/mode/markdown')
        vm.zen.setTheme('ace/theme/dillinger')
        vm.zen.getSession().setUseWrapMode(true)
        vm.zen.renderer.setShowGutter(false)
        vm.zen.setShowPrintMargin(false)
        vm.zen.getSession().setValue(documentsService.getCurrentDocumentBody())

        el.addClass('on')

      false

    return
