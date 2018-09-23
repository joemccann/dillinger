
'use strict'

var md = require('md').md

module.exports =
  angular
    .module('diBase.directives.preview', [])
    .directive('preview', function ($rootScope, debounce) {
      var directive = {
        link: function (scope, el, attrs) {
          var delay = attrs.debounce || 200

          var refreshPreview = function (val) {
            if ($rootScope.viewSrcMode) {
              el.text(md.render($rootScope.editor.getSession().getValue()))
              el.wrap('<pre class="preview-src"><code></code></pre>').removeClass('preview-html')
            } else {
              angular.element('.preview-src').replaceWith(el)
              el.html(md.render($rootScope.editor.getSession().getValue())).addClass('preview-html')
            }

            return $rootScope.$emit('preview.updated')
          }

          $rootScope.editor.on('change', debounce(refreshPreview, delay))
          $rootScope.$watch('viewSrcMode', function () {
            refreshPreview()
          })

          return refreshPreview()
        }
      }

      return directive
    })
