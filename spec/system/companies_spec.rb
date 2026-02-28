# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Companies", type: :system do
  let(:user) { create(:user) }
  let!(:company) { create(:company, name: "Acme Corp", website: "https://acme.example.com", user: user) }

  before { sign_in_system(user) }

  describe "companies list" do
    it "shows all companies in a grid" do
      create(:company, name: "Beta Corp", user: user)
      visit companies_path
      expect(page).to have_text("Acme Corp")
      expect(page).to have_text("Beta Corp")
    end
  end

  describe "viewing a company" do
    it "shows company details and its contacts" do
      contact = create(:contact, first_name: "Bob", last_name: "Smith", company: company, user: user)
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
      click_button "Create Company"
      expect(page).to have_current_path(/companies\/\d+/)
      expect(page).to have_text("NewCo")
    end

    it "shows validation errors for missing name" do
      visit new_company_path
      click_button "Create Company"
      expect(page).to have_text("can't be blank")
    end
  end

  describe "editing a company" do
    it "updates the company and redirects to its page" do
      visit edit_company_path(company)
      fill_in "Company name", with: "Acme Corp Updated"
      click_button "Save Changes"
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

  describe "activity log" do
    it "shows the company's own activities" do
      create(:activity, subject: company, body: "QBR meeting completed.", user: user)
      visit company_path(company)
      expect(page).to have_text("QBR meeting completed.")
    end

    it "shows activities for contacts at the company in the merged log" do
      contact = create(:contact, first_name: "Bob", last_name: "Smith", company: company, user: user)
      create(:activity, subject: contact, body: "Called Bob about the renewal.", user: user)
      visit company_path(company)
      expect(page).to have_text("Called Bob about the renewal.")
    end

    it "logs an activity via the Log popover" do
      visit company_path(company)
      click_button "Log"
      fill_in "Add a note…", with: "Quarterly check-in completed."
      click_button "Log Note"
      expect(page).to have_text("Quarterly check-in completed.")
    end

    it "cancels logging and restores the Log button" do
      visit company_path(company)
      click_button "Log"
      click_button "Cancel"
      expect(page).to have_button("Log")
      expect(page).not_to have_css("textarea")
    end
  end

  describe "editing company notes inline" do
    let!(:company_with_notes) { create(:company, name: "Notes Corp", notes: "Original notes here.", user: user) }

    it "opens editing by clicking the pencil icon (hover-revealed)" do
      visit company_path(company_with_notes)
      find("button[title='Edit notes']", visible: :all).click
      expect(page).to have_css("textarea")
    end

    it "saves updated notes by clicking the text" do
      visit company_path(company_with_notes)
      find("button", text: "Original notes here.").click
      find("textarea").set("Updated company notes.")
      click_button "Save"
      expect(page).to have_text("Updated company notes.")
      expect(page).not_to have_text("Original notes here.")
    end

    it "cancels editing and restores original notes" do
      visit company_path(company_with_notes)
      find("button", text: "Original notes here.").click
      find("textarea").set("Should not be saved.")
      click_button "Cancel"
      expect(page).to have_text("Original notes here.")
      expect(page).not_to have_css("textarea")
    end

    it "opens editing by clicking the placeholder when no notes exist" do
      visit company_path(company)
      find("button", text: "Add notes…").click
      expect(page).to have_css("textarea")
    end
  end
end
