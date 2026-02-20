# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Companies", type: :system do
  let(:user) { create(:user) }
  let!(:company) { create(:company, name: "Acme Corp", website: "https://acme.example.com") }

  before { sign_in_via_browser(user) }

  describe "companies list" do
    it "shows all companies in a grid" do
      create(:company, name: "Beta Corp")
      visit companies_path
      expect(page).to have_text("Acme Corp")
      expect(page).to have_text("Beta Corp")
    end
  end

  describe "viewing a company" do
    it "shows company details and its contacts" do
      contact = create(:contact, first_name: "Bob", last_name: "Smith", company: company)
      visit company_path(company)
      expect(page).to have_text("Acme Corp")
      expect(page).to have_text("acme.example.com")
      expect(page).to have_text("Bob Smith")
    end

    it "shows 0 contacts when company has none" do
      visit company_path(company)
      expect(page).to have_text("0 contacts")
    end
  end

  describe "creating a company" do
    it "creates a new company and redirects to its page" do
      visit new_company_path
      fill_in "Company name", with: "NewCo"
      fill_in "Website", with: "https://newco.example.com"
      click_button "Create company"
      expect(page).to have_current_path(/companies\/\d+/)
      expect(page).to have_text("NewCo")
    end

    it "shows validation errors for missing name" do
      visit new_company_path
      click_button "Create company"
      expect(page).to have_text("can't be blank")
    end
  end

  describe "editing a company" do
    it "updates the company and redirects to its page" do
      visit edit_company_path(company)
      fill_in "Company name", with: "Acme Corp Updated"
      click_button "Save changes"
      expect(page).to have_current_path(company_path(company))
      expect(page).to have_text("Acme Corp Updated")
    end
  end

  describe "deleting a company" do
    it "deletes the company and redirects to companies list" do
      visit company_path(company)
      find("button[title='Delete']").click
      within("[role='alertdialog']") { click_button "Delete" }
      expect(page).to have_current_path(companies_path)
      expect(page).not_to have_text("Acme Corp")
    end
  end
end
