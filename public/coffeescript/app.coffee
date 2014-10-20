
'use strict'

do (window, document) ->

  # jQuery + Bootstrap
  window.jQuery = require('jquery')
  require 'bootstrap/js/dropdown'

  # Angular
  angular = require("exports?angular!angular")
  App = require('./dillinger')

  # Common Shared Directives/Services/Models
  require('./common/debounce.js')

  # Services
  require('./document/Doc')
  require('./document/DocService')
  require('./user/UserService')

  # Controllers
  require('./base/BaseCtrl')
  # require('./user/UserController')
  require('./document/DocumentsController')


  # Directives
  require('./document/directives/MenuToggle')
  require('./document/directives/DocumentTitle')

  angular.bootstrap document, ['Dillinger']

  # Dillinger             = require './core'
  # Dillinger.User        = require './user'
  # Dillinger.FileHandler = require('./fileHandler')
  # Dillinger.init()
