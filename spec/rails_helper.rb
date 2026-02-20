# frozen_string_literal: true

require "spec_helper"
ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
abort("The Rails environment is running in production mode!") if Rails.env.production?

require "rspec/rails"
require "capybara/rspec"
require "selenium-webdriver"

# Precompile Vite assets once before running the test suite
ViteRuby.commands.build

Rails.root.glob("spec/support/**/*.rb").sort_by(&:to_s).each { |f| require f }

begin
  ActiveRecord::Migration.maintain_test_schema!
rescue ActiveRecord::PendingMigrationError => e
  abort e.to_s.strip
end

Capybara.default_max_wait_time = 1

# Demo mode: headed browser with slow-motion delays so you can follow along.
# Usage: DEMO_MODE=1 bundle exec rspec spec/system
if ENV["DEMO_MODE"]
  DEMO_DELAY = ENV.fetch("DEMO_DELAY", "0.4").to_f

  module CapybaraDemoSlowMotion
    def click(*args, **kwargs)
      sleep DEMO_DELAY
      super
    end

    def set(*args, **kwargs)
      super
      sleep DEMO_DELAY
    end
  end

  Capybara::Selenium::Node.prepend(CapybaraDemoSlowMotion)
end

RSpec.configure do |config|
  config.use_transactional_fixtures = true
  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!

  config.before(type: :system) do
    browser = (ENV["DEMO_MODE"] || ENV["HEADED"]) ? :chrome : :headless_chrome
    driven_by :selenium, using: browser, screen_size: [1400, 1400]
  end

  config.include FactoryBot::Syntax::Methods
  config.include ActiveSupport::Testing::TimeHelpers
  config.include AuthenticationHelpers, type: ->(type, _metadata) { [:system, :request, :controller].include?(type) }
end
