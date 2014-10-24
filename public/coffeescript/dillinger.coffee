require 'angular-bootstrap'

require './factorys/sheet.factory'
require './services/documents.service'
require './services/documents.export.service'
require './documents/documents-export.controller'
require './documents/documents.controller'

require './plugins/github/github.service'
require './plugins/github/github-modal.controller'
require './plugins/github/github.controller'

require './plugins/dropbox/dropbox.service'
require './plugins/dropbox/dropbox-modal.controller'
require './plugins/dropbox/dropbox.controller'

module.exports = angular.module('Dillinger', [
  'documents'
  'plugins.github'
  'plugins.dropbox'
  'ui.bootstrap'
])
