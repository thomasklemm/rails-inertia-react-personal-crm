# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Contacts", type: :system do
  let(:user) { create(:user) }
  let!(:company) { create(:company, name: "Acme Corp") }
  let!(:contact) { create(:contact, first_name: "Zara", last_name: "Ahmed", email: "zara@acme.example.com", company: company, starred: false) }

  before { sign_in_via_browser(user) }

  describe "contacts list" do
    it "shows the contact list in the sidebar" do
      visit contacts_path
      expect(page).to have_text("Zara Ahmed")
      expect(page).to have_text("Acme Corp")
    end

    it "searches for contacts by name" do
      create(:contact, first_name: "Other", last_name: "Person")
      visit contacts_path
      fill_in "Search contacts…", with: "Zara"
      expect(page).to have_text("Zara Ahmed")
      expect(page).not_to have_text("Other Person")
    end

    it "filters starred contacts" do
      contact.update!(starred: true)
      create(:contact, first_name: "Bob", last_name: "Plain", starred: false)
      visit contacts_path
      click_button "Starred"
      expect(page).to have_text("Zara Ahmed")
      expect(page).not_to have_text("Bob Plain")
    end
  end

  describe "viewing a contact" do
    it "shows contact details in the right panel" do
      visit contact_path(contact)
      expect(page).to have_text("Zara Ahmed")
      expect(page).to have_text("zara@acme.example.com")
      expect(page).to have_text("Acme Corp")
    end

    it "shows the activity log form" do
      visit contact_path(contact)
      expect(page).to have_text("Log Activity")
      expect(page).to have_button("Note")
      expect(page).to have_button("Call")
      expect(page).to have_button("Email")
    end
  end

  describe "creating a contact" do
    it "creates a new contact and redirects to their page" do
      visit new_contact_path
      fill_in "First name", with: "Alice"
      fill_in "Last name", with: "Wonderland"
      fill_in "Email", with: "alice@example.com"
      click_button "Create Contact"
      expect(page).to have_current_path(/contacts\/\d+/)
      expect(page).to have_text("Alice Wonderland")
    end

    it "shows validation errors for missing required fields" do
      visit new_contact_path
      click_button "Create Contact"
      expect(page).to have_text("can't be blank")
    end
  end

  describe "editing a contact" do
    it "updates the contact and redirects to their page" do
      visit edit_contact_path(contact)
      fill_in "First name", with: "Zara Updated"
      click_button "Save Changes"
      expect(page).to have_current_path(contact_path(contact))
      expect(page).to have_text("Zara Updated")
    end
  end

  describe "deleting a contact" do
    it "deletes the contact and redirects to contacts list" do
      visit contact_path(contact)
      find("button[title='Delete']").click
      within("[role='alertdialog']") { click_button "Delete" }
      expect(page).to have_current_path(contacts_path)
      expect(page).not_to have_text("Zara Ahmed")
    end
  end

  describe "starring a contact" do
    it "toggles the star on a contact" do
      visit contact_path(contact)
      find("button[title='Star']").click
      expect(page).to have_css("button[title='Unstar']")
    end
  end

  describe "archiving a contact" do
    it "archives the contact and removes from active list" do
      visit contact_path(contact)
      find("button[title='Archive']").click
      within("[role='alertdialog']") { click_button "Archive" }
      # Archive redirects back to the contact page — navigate to the list to verify
      visit contacts_path
      expect(page).not_to have_text("Zara Ahmed")
      click_button "Archived"
      expect(page).to have_text("Zara Ahmed")
    end
  end
end
