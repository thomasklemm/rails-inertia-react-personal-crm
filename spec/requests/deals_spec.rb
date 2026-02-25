# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Deals", type: :request do
  let(:user) { create(:user) }

  before { sign_in_as(user) }

  describe "GET /deals" do
    it "renders deals/index" do
      get deals_path
      expect(inertia).to render_component("deals/index")
    end

    it "passes deals_by_stage grouped by all 5 stages" do
      get deals_path
      grouped = inertia.props[:deals_by_stage]
      expect(grouped.keys.map(&:to_s)).to match_array(Deal::STAGES)
    end

    it "includes only the current user's deals" do
      other_user = create(:user)
      my_deal    = create(:deal, user:, stage: "lead")
      their_deal = create(:deal, user: other_user, stage: "lead")

      get deals_path
      ids = inertia.props[:deals_by_stage]["lead"].map { |d| d["id"] }
      expect(ids).to include(my_deal.id)
      expect(ids).not_to include(their_deal.id)
    end

    it "passes pipeline_value as dollars summing only open deals" do
      create(:deal, user:, stage: "lead",       value_cents: 10_000_00)
      create(:deal, user:, stage: "proposal",   value_cents: 20_000_00)
      create(:deal, user:, stage: "closed_won", value_cents: 5_000_00)  # excluded

      get deals_path
      expect(inertia.props[:pipeline_value]).to eq(30_000.0)
    end

    it "passes stages array" do
      get deals_path
      expect(inertia.props[:stages]).to eq(Deal::STAGES)
    end
  end

  describe "GET /deals/:id" do
    let(:contact) { create(:contact, user:) }
    let(:deal)    { create(:deal, user:, contact: contact) }

    it "renders deals/show" do
      get deal_path(deal)
      expect(inertia).to render_component("deals/show")
    end

    it "includes deal prop with contact" do
      get deal_path(deal)
      deal_prop = inertia.props[:deal]
      expect(deal_prop["id"]).to eq(deal.id)
      expect(deal_prop["contact"]).to include("id" => contact.id)
    end

    it "includes activities prop" do
      create(:activity, subject: deal, user:)
      get deal_path(deal)
      expect(inertia.props[:activities]).to be_an(Array)
      expect(inertia.props[:activities].length).to eq(1)
    end

    it "redirects to deals index for another user's deal" do
      other_deal = create(:deal, user: create(:user))
      get deal_path(other_deal)
      expect(response).to redirect_to(deals_path)
    end
  end

  # new/edit render as modals — tested via POST /deals and PATCH /deals/:id instead
  describe "GET /deals/new (modal base_url redirect)" do
    it "redirects unauthenticated requests to sign in" do
      sign_out
      get new_deal_path
      expect(response).to redirect_to(sign_in_path)
    end
  end

  describe "POST /deals" do
    let(:company) { create(:company, user:) }

    it "creates a deal and redirects to show" do
      post deals_path, params: {title: "Big Deal", stage: "lead", value: "5000"}
      expect(response).to redirect_to(deal_path(Deal.last))
      follow_redirect!
      expect(inertia).to have_flash(notice: "Deal created.")
    end

    it "persists all attributes" do
      post deals_path, params: {title: "My Deal", stage: "proposal", value: "12500.50", notes: "Notes here"}
      deal = Deal.last
      expect(deal.title).to eq("My Deal")
      expect(deal.stage).to eq("proposal")
      expect(deal.value_cents).to eq(1_250_050)
      expect(deal.notes).to eq("Notes here")
    end

    it "assigns the deal to the current user" do
      post deals_path, params: {title: "My Deal", stage: "lead", value: "0"}
      expect(Deal.last.user).to eq(user)
    end

    it "associates a company" do
      post deals_path, params: {title: "My Deal", stage: "lead", value: "0", company_id: company.id}
      expect(Deal.last.company).to eq(company)
    end

    it "redirects back to new on validation error" do
      post deals_path, params: {title: "", stage: "lead", value: "0"}
      expect(response).to redirect_to(new_deal_path)
    end
  end

  # edit renders as a modal — tested via PATCH /deals/:id instead

  describe "PATCH /deals/:id" do
    let(:deal) { create(:deal, user:, title: "Old Title", value_cents: 1_000_00) }

    it "updates the deal and redirects to show" do
      patch deal_path(deal), params: {title: "New Title", stage: "proposal", value: "2000"}
      expect(response).to redirect_to(deal_path(deal))
      follow_redirect!
      expect(inertia).to have_flash(notice: "Deal updated.")
    end

    it "persists updated attributes" do
      patch deal_path(deal), params: {title: "Updated", stage: "qualified", value: "9999"}
      deal.reload
      expect(deal.title).to eq("Updated")
      expect(deal.stage).to eq("qualified")
      expect(deal.value_cents).to eq(999_900)
    end
  end

  describe "DELETE /deals/:id" do
    let(:deal) { create(:deal, user:) }

    it "destroys the deal and redirects to index" do
      delete deal_path(deal)
      expect(response).to redirect_to(deals_path)
      follow_redirect!
      expect(inertia).to have_flash(notice: "Deal deleted.")
      expect(Deal.find_by(id: deal.id)).to be_nil
    end
  end

  describe "PATCH /deals/:id/advance" do
    it "moves a lead to qualified" do
      deal = create(:deal, user:, stage: "lead")
      patch advance_deal_path(deal)
      expect(deal.reload.stage).to eq("qualified")
    end

    it "moves qualified to proposal" do
      deal = create(:deal, user:, stage: "qualified")
      patch advance_deal_path(deal)
      expect(deal.reload.stage).to eq("proposal")
    end

    it "moves proposal to closed_won" do
      deal = create(:deal, user:, stage: "proposal")
      patch advance_deal_path(deal)
      expect(deal.reload.stage).to eq("closed_won")
    end

    it "does not advance past closed_lost" do
      deal = create(:deal, user:, stage: "closed_lost")
      patch advance_deal_path(deal)
      expect(deal.reload.stage).to eq("closed_lost")
    end
  end

  describe "PATCH /deals/:id/move" do
    let(:deal) { create(:deal, user:, stage: "lead") }

    it "moves to an arbitrary valid stage" do
      patch move_deal_path(deal), params: {stage: "closed_won"}
      expect(deal.reload.stage).to eq("closed_won")
    end

    it "does not move to an invalid stage" do
      patch move_deal_path(deal), params: {stage: "bogus"}
      expect(deal.reload.stage).to eq("lead")
      follow_redirect!
      expect(inertia).to have_flash(alert: "Invalid stage.")
    end
  end

  describe "contacts#show includes deals" do
    let(:contact) { create(:contact, user:) }

    it "passes deals prop on contact show" do
      deal = create(:deal, user:, contact: contact, stage: "proposal")
      get contact_path(contact)
      ids = inertia.props[:deals].map { |d| d["id"] }
      expect(ids).to include(deal.id)
    end

    it "passes empty deals array when contact has no deals" do
      get contact_path(contact)
      expect(inertia.props[:deals]).to eq([])
    end
  end

  describe "companies#show includes deals" do
    let(:company) { create(:company, user:) }

    it "passes deals prop on company show" do
      deal = create(:deal, user:, company: company, stage: "qualified")
      get company_path(company)
      ids = inertia.props[:deals].map { |d| d["id"] }
      expect(ids).to include(deal.id)
    end

    it "passes empty deals array when company has no deals" do
      get company_path(company)
      expect(inertia.props[:deals]).to eq([])
    end
  end

  describe "authentication" do
    before { sign_out }

    it "redirects unauthenticated requests to sign in" do
      get deals_path
      expect(response).to redirect_to(sign_in_path)
    end
  end
end
