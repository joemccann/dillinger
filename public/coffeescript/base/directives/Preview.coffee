
Dillinger = require('../../dillinger')
marked    = require('marked')

preview = Dillinger.directive 'preview',
  ($rootScope) ->

    directive =
      link: (scope, el, attrs) ->

        scope.refreshPreview = (val) ->
          console.log "preview.refreshPreview"
          el.html(marked($rootScope.editor.getSession().getValue()))

        $rootScope.editor.on 'change', scope.refreshPreview
        scope.$on 'preview.refresh', scope.refreshPreview

        scope.refreshPreview()
        scope.$emit 'wordcount.refresh'

    return directive

module.exports = preview
