require 'angular-bootstrap'

require './factorys/sheet.factory'
require './services/documents.service'
require './services/documents.export.service'
require './documents/documents-export.controller'
require './documents/documents.controller'

require './plugins/github.service'
require './plugins/github-modal.controller'
require './plugins/github.controller'

module.exports = angular.module('Dillinger', [
  'documents'
  'plugins.github'
  'ui.bootstrap'
])
