ENV['RAILS_ENV'] = ENV['RACK_ENV'] = 'test'

$:.unshift("#{File.dirname(__FILE__)}/..")
require File.expand_path('dummy_rails/config/environment', File.dirname(__FILE__))

require 'test-unit'

require 'sass'

require 'rails/test_help'

Dir[File.expand_path("./support/**/*.rb", File.dirname(__FILE__))].each { |f| require f }

#= Capybara + Poltergeist
require 'capybara/rails'
require 'capybara/poltergeist'

Capybara.register_driver :poltergeist do |app|
  Capybara::Poltergeist::Driver.new(
      app,
      # inspector:   '/Applications/Chromium.app/Contents/MacOS/Chromium', # open in inspector: page.driver.debug
      window_size: [1280, 1024],
      js_errors: true, debug: true
  )
end

Capybara.configure do |config|
  config.app_host = 'http://localhost:7000'
  config.default_driver    = :poltergeist
  config.javascript_driver = :poltergeist
  config.server_port       = 7000
  config.default_wait_time = 10
end

