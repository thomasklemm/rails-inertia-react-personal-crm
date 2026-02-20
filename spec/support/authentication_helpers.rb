# frozen_string_literal: true

module AuthenticationHelpers
  extend ActiveSupport::Concern

  def sign_in_as(user)
    session = user.sessions.create!

    request = ActionDispatch::Request.new(Rails.application.env_config)
    cookies = request.cookie_jar
    cookies.signed.permanent[:session_token] = {value: session.id, httponly: true}
  end

  def sign_out
    request = ActionDispatch::Request.new(Rails.application.env_config)
    cookies = request.cookie_jar
    cookies.delete(:session_token)
  end

  # For system tests — injects a signed session cookie directly, skipping the UI.
  # Use sign_in_via_browser only in specs that test the login flow itself.
  def sign_in_system(user)
    session = user.sessions.create!

    request = ActionDispatch::Request.new(Rails.application.env_config)
    jar = request.cookie_jar
    jar.signed.permanent[:session_token] = {value: session.id, httponly: true}
    signed_value = jar[:session_token]

    # Selenium requires at least one page visit before cookies can be set for the domain.
    visit "/"
    page.driver.browser.manage.add_cookie(name: "session_token", value: signed_value, path: "/")
  end

  # For system tests — signs in through the browser UI (use for login flow specs only)
  def sign_in_via_browser(user, password: "Secret1*3*5*")
    visit sign_in_path
    fill_in "Email address", with: user.email
    fill_in "Password", with: password
    click_button "Log in"
    expect(page).to have_current_path(contacts_path)
  end
end
