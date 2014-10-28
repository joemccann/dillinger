
'use strict';

module.exports =
  angular
  .module('diZenMode', ['diZenMode.directives'])
  .controller('diZenMode', function($rootScope, $compile, documentsService) {

  var
    vm = this,
    template;

  vm.isZen  = false;
  vm.zen    = null;

  template  = require('raw!./zen-mode.directive.html');

  vm.toggle = function() {

    var el, scope;

    vm.isZen = !vm.isZen;

    if (vm.isZen === true) {

      scope = $rootScope.$new();
      el    = $compile(template)(scope);

      angular.element(document.body).append(el);

      scope.$close = function() {
        vm.isZen = !vm.isZen;
        documentsService.setCurrentDocumentBody(vm.zen.getSession().getValue());
        $rootScope.$emit('document.refresh');
        el.remove();
        scope.$destroy();
        return false;
      };

      require('brace/mode/markdown');
      require('../documents/theme-dillinger');

      vm.zen = ace.edit('zen');
      vm.zen.getSession().setUseWrapMode(true);
      vm.zen.renderer.setShowGutter(false);
      vm.zen.setShowPrintMargin(false);
      vm.zen.getSession().setValue(documentsService.getCurrentDocumentBody());

      el.addClass('on');
    }
    return false;
  };
});
