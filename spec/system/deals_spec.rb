# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Deals", type: :system do
  let(:user) { create(:user) }
  let!(:lead_deal) { create(:deal, title: "Lead Deal Alpha", stage: "lead", value_cents: 5_000_00, user: user) }
  let!(:qualified_deal) { create(:deal, title: "Qualified Deal Beta", stage: "qualified", value_cents: 10_000_00, user: user) }

  before { sign_in_system(user) }

  describe "deals board" do
    it "shows all deals on the kanban board" do
      visit deals_path
      expect(page).to have_text("Lead Deal Alpha")
      expect(page).to have_text("Qualified Deal Beta")
    end

    it "shows stage column headers" do
      visit deals_path
      expect(page).to have_text("Lead")
      expect(page).to have_text("Qualified")
      expect(page).to have_text("Proposal")
    end

    it "links deal cards to the deal detail page" do
      visit deals_path
      click_link "Lead Deal Alpha"
      expect(page).to have_current_path(deal_path(lead_deal))
    end
  end

  describe "creating a deal" do
    it "opens the new deal modal and creates a deal" do
      visit deals_path
      click_link "Add Deal"
      expect(page).to have_text("New Deal")
      fill_in "Title", with: "New Pipeline Deal"
      click_button "Create Deal"
      expect(page).to have_text("New Pipeline Deal")
    end
  end

  describe "moving a deal stage" do
    it "moves a deal to a different stage via the stage progression widget" do
      visit deal_path(lead_deal)

      # Stage widget renders open stages as clickable buttons
      expect(page).to have_text("Lead")
      expect(page).to have_text("Qualified")

      click_button "Qualified"

      # Page reloads with the new stage reflected
      expect(page).to have_current_path(deal_path(lead_deal))
      expect(lead_deal.reload.stage).to eq("qualified")
    end
  end

  describe "viewing a deal" do
    let!(:deal) { create(:deal, title: "Enterprise Contract", stage: "proposal", value_cents: 50_000_00, user: user) }

    it "shows the deal title and value" do
      visit deal_path(deal)
      expect(page).to have_text("Enterprise Contract")
      expect(page).to have_text("$50,000")
    end
  end

  describe "logging an activity on a deal" do
    let!(:deal) { create(:deal, title: "Activity Deal", stage: "lead", user: user) }

    it "logs a note from the deal page" do
      visit new_activity_path(subject_type: "Deal", subject_id: deal.id)
      fill_in "Add a note…", with: "Discussed deal terms with the team."
      click_button "Log Note"
      expect(page).to have_current_path(deal_path(deal))
      expect(page).to have_text("Discussed deal terms with the team.")
    end
  end
end
