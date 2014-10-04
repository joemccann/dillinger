do ($ = jQuery, document, window) ->

  class User

    constructor: ->
      @Defaults =

        NightMode: false
        WordCount: true

        AutoSave:
          enabled:  true
          interval: 3000
          fn:       undefined

        CurrentFile:     null
        CurrentFileName: 'Untitled Document'

        Files: {}

        Github:
          current_uri: ''
          opts: {}

        Dropbox:
          filepath: '/Dillinger/'

    init: ->
      @Profile = $.extend {}, @Defaults, @getProfile()
      return

    saveProfile: ->
      if localStorage.setItem('Profile', JSON.stringify(@Profile))
        return true
      false

    updateProfile: (obj) ->
      @Profile.CurrentFile = Dillinger.Editor.getSession().getValue()
      @Profile.CurrentFileName = Dillinger.getCurrentFilenameFromField()
      @saveProfile()
      return

    resetProfile: ->
      localStorage.clear()
      localStorage.setItem('Profile', null)
      window.location.reload()

    getProfile: ->
      try
        p = JSON.parse(localStorage.getItem('Profile'))
      catch e
        p = Defaults
      p

  module.exports = new User()
