
Dillinger = require('../../dillinger')
marked    = require('marked')

preview = Dillinger.directive 'preview',
  ($rootScope) ->

    directive =
      link: (scope, el, attrs) ->

        refreshPreview = (val) ->
          el.html(marked($rootScope.editor.getSession().getValue()))
          $rootScope.$emit 'preview.updated'

        $rootScope.editor.on 'change', refreshPreview
        refreshPreview()

    return directive

module.exports = preview
