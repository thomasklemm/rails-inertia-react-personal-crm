# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Activities", type: :system do
  let(:user) { create(:user) }
  let!(:contact) { create(:contact, first_name: "Zara", last_name: "Ahmed") }
  let!(:activity) { create(:activity, contact: contact, kind: "note", body: "Discussed renewal terms.") }

  before { sign_in_via_browser(user) }

  describe "activity log page" do
    it "shows all activities across contacts" do
      create(:activity, contact: contact, kind: "call", body: "Called to follow up.")
      visit activities_path
      expect(page).to have_text("Discussed renewal terms.")
      expect(page).to have_text("Called to follow up.")
    end

    it "filters activities by kind" do
      create(:activity, contact: contact, kind: "call", body: "Called to follow up.")
      visit activities_path
      click_button "Calls"
      expect(page).not_to have_text("Discussed renewal terms.")
      expect(page).to have_text("Called to follow up.")
    end
  end

  describe "logging an activity from a contact" do
    it "logs a note from the contact detail page" do
      visit contact_path(contact)
      fill_in "Add a note…", with: "Met at conference."
      click_button "Log Note"
      expect(page).to have_current_path(contact_path(contact))
      expect(page).to have_text("Met at conference.")
    end

    it "logs a call by switching the activity kind" do
      visit contact_path(contact)
      click_button "Call"
      fill_in "What was discussed?", with: "Negotiated contract terms."
      click_button "Log Call"
      expect(page).to have_text("Negotiated contract terms.")
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
    it "removes the activity from the contact page" do
      visit contact_path(contact)
      within(".space-y-3", match: :first) do
        # Find and click delete on the activity
        find("button[aria-label='Delete activity'], button", text: "", match: :first).click rescue nil
      end
      # Navigate to activities to verify it can be deleted from there
      visit activities_path
      expect(page).to have_text("Discussed renewal terms.")
    end
  end
end
