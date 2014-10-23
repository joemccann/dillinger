
'use strict'

do (window, document) ->

  # jQuery
  window.jQuery = require('jquery')

  # Angular
  angular = require("exports?angular!angular")

  require('./dillinger')

  # User
  require('./services/user.service')
  require('./user/user.controller')

  require('./services/wordscount.service')

  # Controllers
  require('./base/base.controller')

  # Directives
  require('./components/document-title.directive')
  require('./components/toggle-menu.directive')
  require('./components/toggle-settings.directive')
  require('./components/toggle-preview.directive')
  require('./components/switch.directive')
  require('./components/preview.directive')

  require('./vendor/wtfisdillinger-modal.controller')

  angular.bootstrap document, ['Dillinger']
