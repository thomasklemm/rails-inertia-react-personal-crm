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

  describe "editing an activity via pencil button" do
    it "opens the edit dialog when the pencil icon is clicked" do
      visit activities_path
      find("button[title='Edit']", visible: :all).click
      expect(page).to have_css("[role='dialog']")
      expect(page).to have_field(with: "Discussed renewal terms.")
    end
  end

  describe "logging an activity from a contact" do
    it "logs a note" do
      visit contact_path(contact)
      click_button "Log Activity"
      fill_in "Add a note…", with: "Met at conference."
      click_button "Log Note"
      expect(page).to have_current_path(contact_path(contact))
      expect(page).to have_text("Met at conference.")
    end

    it "logs a call by switching the activity kind" do
      visit contact_path(contact)
      click_button "Log Activity"
      within("[role='dialog']") { find("button", text: "Call", exact_text: true).click }
      fill_in "What was discussed?", with: "Negotiated contract terms."
      click_button "Log Call"
      expect(page).to have_current_path(contact_path(contact))
      expect(page).to have_text("Negotiated contract terms.")
    end
  end

  describe "logging an activity from a company" do
    it "logs a note" do
      visit company_path(company)
      click_button "Log Activity"
      fill_in "Add a note…", with: "Company partnership discussed."
      click_button "Log Note"
      expect(page).to have_current_path(company_path(company))
      expect(page).to have_text("Company partnership discussed.")
    end
  end

  describe "editing an activity" do
    it "updates the activity body via the edit dialog" do
      visit activities_path
      find("button[title='Edit']", visible: :all).click
      within("[role='dialog']") do
        fill_in with: "Updated: signed the contract."
        click_button "Save Changes"
      end
      expect(page).to have_text("Updated: signed the contract.")
      expect(page).not_to have_text("Discussed renewal terms.")
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

  describe "backdated activities" do
    it "groups a backdated activity under its occurrence date, not Today" do
      create(:activity,
        subject: contact,
        body: "Old quarterly review.",
        occurred_at: 10.days.ago,
        user: user
      )
      visit activities_path

      # Date headings render uppercase via CSS text-transform
      expect(page).to have_text("TODAY")
      expect(page).to have_text("Discussed renewal terms.")
      expect(page).to have_text("Old quarterly review.")

      rendered = page.find("body").text
      # Recent activity appears before the backdated one (desc occurred_at order)
      expect(rendered.index("Discussed renewal terms.")).to be < rendered.index("Old quarterly review.")
      # Backdated activity appears after the Today heading (i.e. not grouped under Today)
      expect(rendered.index("TODAY")).to be < rendered.index("Old quarterly review.")
    end

    it "groups an activity logged yesterday under the 'Yesterday' heading" do
      create(:activity,
        subject: contact,
        body: "Yesterday's check-in.",
        occurred_at: 1.day.ago,
        user: user
      )
      visit activities_path

      # Date headings render uppercase via CSS text-transform
      expect(page).to have_text("YESTERDAY")
      expect(page).to have_text("Yesterday's check-in.")
    end

    it "logs a backdated note via the 'Yesterday' preset in the activity log dialog" do
      visit contact_path(contact)
      click_button "Log Activity"

      # Default date is Today — click the date picker trigger to change it
      find("button", text: "Today").click

      # Select Yesterday from the preset
      find("button", text: "Yesterday", exact_text: true).click

      fill_in "Add a note…", with: "Backdated follow-up."
      click_button "Log Note"

      expect(page).to have_text("Yesterday")
      expect(page).to have_text("Backdated follow-up.")
    end

    it "updates occurred_at to Yesterday via the date picker in the edit dialog" do
      visit activities_path

      find("button[title='Edit']", visible: :all).click
      # Click the "Today" date trigger inside the dialog
      within("[role='dialog']") { find("button", text: "Today").click }
      # The date picker popover renders outside the dialog via portal
      find("button", text: "Yesterday", exact_text: true).click
      within("[role='dialog']") { click_button "Save Changes" }

      expect(activity.reload.occurred_at.to_date).to eq(1.day.ago.to_date)
    end
  end
end
