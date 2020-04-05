const md = require('md')

module.exports =
  angular
    .module('diBase.directives.preview', [])
    .directive('preview', ($rootScope, debounce) => {
      const directive = {
        link: function (scope, el, attrs) {
          const delay = attrs.debounce || 200

          const refreshPreview = (val) => {
            if ($rootScope.viewSrcMode) {
              el.text(md.render($rootScope.editor.getSession().getValue()))
              el.wrap('<pre class="preview-src"><code></code></pre>')
                .removeClass('preview-html')
            } else {
              angular.element('.preview-src').replaceWith(el)
              el.html(md.render($rootScope.editor.getSession().getValue()))
                .addClass('preview-html')
            }

            return $rootScope.$emit('preview.updated')
          }

          $rootScope.editor.on('change', debounce(refreshPreview, delay))
          $rootScope.$watch('viewSrcMode', () => {
            refreshPreview()
          })

          return refreshPreview()
        }
      }

      return directive
    })
