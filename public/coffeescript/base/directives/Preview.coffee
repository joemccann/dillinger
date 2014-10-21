
Dillinger = require('../../dillinger')
marked    = require('marked')

preview = Dillinger.directive 'preview',
  ($rootScope) ->

    directive =
      link: (scope, el, attrs) ->

        refreshPreview = (val) ->
          console.log "preview.refreshPreview"
          el.html(marked($rootScope.editor.getSession().getValue()))

        $rootScope.editor.on 'change', refreshPreview

        refreshPreview()

    return directive

module.exports = preview
