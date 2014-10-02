$ ->

  $(".menu-sidebar").on "click", ".menu-item", ->
    $that = $(@)
    $that.toggleClass('open')

  $(".toggle").on "click", ->
    $("body").toggleClass("open-menu")
