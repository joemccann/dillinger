require 'angular-bootstrap'

require './plugins/github.controller'
require './plugins/github-modal.controller'
require './plugins/github.service'

module.exports = angular.module('Dillinger', [
  'plugins.github'
  'plugins.github.modal'
  'plugins.github.service'
  'ui.bootstrap'
])
