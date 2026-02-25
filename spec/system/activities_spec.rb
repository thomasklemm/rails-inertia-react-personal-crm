# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Activities", type: :system do
  let(:user) { create(:user) }
  let!(:contact) { create(:contact, first_name: "Zara", last_name: "Ahmed", user: user) }
  let!(:company) { create(:company, name: "Acme Corp", user: user) }
  let!(:activity) { create(:activity, subject: contact, kind: "note", body: "Discussed renewal terms.", user: user) }

  before { sign_in_system(user) }

  describe "activity log page" do
    it "shows all activities across contacts" do
      create(:activity, subject: contact, kind: "call", body: "Called to follow up.", user: user)
      visit activities_path
      expect(page).to have_text("Discussed renewal terms.")
      expect(page).to have_text("Called to follow up.")
    end

    it "filters activities by kind" do
      create(:activity, subject: contact, kind: "call", body: "Called to follow up.", user: user)
      visit activities_path
      find('button[aria-label="Calls"]').click
      expect(page).not_to have_text("Discussed renewal terms.")
      expect(page).to have_text("Called to follow up.")
    end

    it "links contact activities to the contact page" do
      visit activities_path
      expect(page).to have_link("Zara Ahmed", href: contact_path(contact))
    end

    it "links company activities to the company page" do
      create(:activity, subject: company, kind: "note", body: "Company check-in.", user: user)
      visit activities_path
      expect(page).to have_link("Acme Corp", href: company_path(company))
    end
  end

  describe "searching activities" do
    let!(:other_contact) { create(:contact, first_name: "Carlos", last_name: "Ruiz", user: user) }
    let!(:other_activity) { create(:activity, subject: other_contact, body: "Partnership call.", user: user) }

    it "finds activities by body text" do
      visit activities_path
      fill_in "Search activities, contacts, companies, or deals…", with: "renewal"
      expect(page).to have_text("Discussed renewal terms.")
      expect(page).not_to have_text("Partnership call.")
    end

    it "finds activities by contact name" do
      visit activities_path
      fill_in "Search activities, contacts, companies, or deals…", with: "Zara"
      expect(page).to have_text("Discussed renewal terms.")
      expect(page).not_to have_text("Partnership call.")
    end

    it "finds activities by company name" do
      create(:activity, subject: company, body: "Company review meeting.", user: user)
      visit activities_path
      fill_in "Search activities, contacts, companies, or deals…", with: "Acme"
      expect(page).to have_text("Company review meeting.")
      expect(page).not_to have_text("Discussed renewal terms.")
    end

    it "matches each search word independently across subject and body" do
      visit activities_path
      fill_in "Search activities, contacts, companies, or deals…", with: "Zara renewal"
      expect(page).to have_text("Discussed renewal terms.")
      expect(page).not_to have_text("Partnership call.")
    end

    it "returns no results when words don't all match" do
      visit activities_path
      fill_in "Search activities, contacts, companies, or deals…", with: "Zara partnership"
      expect(page).not_to have_text("Discussed renewal terms.")
      expect(page).not_to have_text("Partnership call.")
    end
  end

  describe "inline editing an activity" do
    it "edits the body by double-clicking the text" do
      visit activities_path
      find("p", text: "Discussed renewal terms.").double_click
      find("textarea").set("Updated via inline edit.")
      click_button "Save"
      expect(page).to have_text("Updated via inline edit.")
      expect(page).not_to have_text("Discussed renewal terms.")
    end

    it "changes the activity kind inline" do
      visit activities_path
      find("p", text: "Discussed renewal terms.").double_click
      find("button", text: "Call", exact_text: true).click
      click_button "Save"
      expect(page).to have_text("Call")
    end

    it "cancels inline editing and restores the original text" do
      visit activities_path
      find("p", text: "Discussed renewal terms.").double_click
      find("textarea").set("This should not be saved.")
      click_button "Cancel"
      expect(page).to have_text("Discussed renewal terms.")
      expect(page).not_to have_text("This should not be saved.")
    end
  end

  describe "logging an activity from a contact" do
    it "logs a note" do
      visit new_activity_path(subject_type: "Contact", subject_id: contact.id)
      fill_in "Add a note…", with: "Met at conference."
      click_button "Log Note"
      expect(page).to have_current_path(contact_path(contact))
      expect(page).to have_text("Met at conference.")
    end

    it "logs a call by switching the activity kind" do
      visit new_activity_path(subject_type: "Contact", subject_id: contact.id)
      within("form") { find("button", text: "Call", exact_text: true).click }
      fill_in "What was discussed?", with: "Negotiated contract terms."
      click_button "Log Call"
      expect(page).to have_current_path(contact_path(contact))
      expect(page).to have_text("Negotiated contract terms.")
    end
  end

  describe "logging an activity from a company" do
    it "logs a note" do
      visit new_activity_path(subject_type: "Company", subject_id: company.id)
      fill_in "Add a note…", with: "Company partnership discussed."
      click_button "Log Note"
      expect(page).to have_current_path(company_path(company))
      expect(page).to have_text("Company partnership discussed.")
    end
  end

  describe "editing an activity" do
    it "updates the activity body" do
      visit edit_activity_path(activity)
      fill_in "Details", with: "Updated: signed the contract."
      click_button "Save Changes"
      expect(page).to have_text("Updated: signed the contract.")
    end
  end

  describe "deleting an activity" do
    it "removes the activity via the delete button and confirmation dialog" do
      visit activities_path
      find("button[title='Delete']", visible: :all).click
      within("[role='alertdialog']") { click_button "Delete" }
      expect(page).not_to have_text("Discussed renewal terms.")
    end
  end
end
