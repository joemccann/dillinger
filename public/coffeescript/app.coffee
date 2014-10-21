
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

  # Models
  require('./document/DocModel')

  # Services
  require('./document/DocService')
  require('./document/WordCountService')
  require('./user/UserService')

  # Controllers
  require('./base/BaseCtrl')
  require('./user/UserController')
  require('./document/DocumentsController')

  # Directives
  require('./base/directives/MenuToggle')
  require('./base/directives/SettingsToggle')
  require('./base/directives/Switch')
  require('./base/directives/Preview')
  # require('./base/directives/Wordcount')
  require('./document/directives/DocumentTitle')

  angular.bootstrap document, ['Dillinger']

  # Dillinger             = require './core'
  # Dillinger.User        = require './user'
  # Dillinger.FileHandler = require('./fileHandler')
  # Dillinger.init()
