require 'angular-bootstrap'

# User
require('./user/user.controller')
require('./services/user.service')

# Documents
require './factorys/sheet.factory'
require './services/documents.service'
require './services/documents.export.service'
require './documents/documents-export.controller'
require './documents/documents.controller'

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

module.exports = angular.module('Dillinger', [
  'documents'
  'diNotify'
  'diUser'
  'diZenMode'
  'plugins.github'
  'plugins.dropbox'
  'plugins.googledrive'
  'plugins.onedrive'
  'ui.bootstrap'
])
