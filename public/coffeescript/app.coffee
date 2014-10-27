
'use strict'

do (window, document) ->

  # jQuery
  window.jQuery = require('jquery')

  # Angular
  angular = require("exports?angular!angular")

  require 'angular-bootstrap'

  # Base
  require('./base/base.controller')
  require('./components/document-title.directive')
  require('./components/toggle-menu.directive')
  require('./components/toggle-settings.directive')
  require('./components/toggle-preview.directive')
  require('./components/switch.directive')
  require('./components/preview.directive')
  require('./vendor/wtfisdillinger-modal.controller')

  # User
  require('./user/user.controller')
  require('./services/user.service')

  # Documents
  require './factorys/sheet.factory'
  require './services/documents.service'
  require './services/documents.export.service'
  require './documents/documents-export.controller'
  require './documents/documents.controller'
  require('./services/wordscount.service')

  # Github
  require './plugins/github/github.service'
  require './plugins/github/github-modal.controller'
  require './plugins/github/github.controller'

  # Dropbox
  require './plugins/dropbox/dropbox.service'
  require './plugins/dropbox/dropbox-modal.controller'
  require './plugins/dropbox/dropbox.controller'

  # Google Drive
  require './plugins/google-drive/google-drive.service'
  require './plugins/google-drive/google-drive-modal.controller'
  require './plugins/google-drive/google-drive.controller'

  # One Drive
  require './plugins/one-drive/one-drive.service'
  require './plugins/one-drive/one-drive-modal.controller'
  require './plugins/one-drive/one-drive.controller'

  # Notifications
  require './services/notification.service'

  # Zen Mode
  require './zen-mode/zen-mode.controller'
  require './zen-mode/zen-mode-toggle.directive'

  angular.module('Dillinger', [
    'diBase'
    'diDocuments'
    'diNotify'
    'diUser'
    'diZenMode'
    'plugins.github'
    'plugins.dropbox'
    'plugins.googledrive'
    'plugins.onedrive'
    'ui.bootstrap'
  ])

  angular.bootstrap document, ['Dillinger']

  jQuery(window).on 'load', ->
    jQuery('.splashscreen').animate(opacity: 0 , 400, ->
      jQuery('.splashscreen').remove()
    )
