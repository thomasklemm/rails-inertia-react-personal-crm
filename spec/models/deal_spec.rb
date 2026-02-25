# frozen_string_literal: true

require "rails_helper"

RSpec.describe Deal, type: :model do
  describe "validations" do
    it "is valid with all required attributes" do
      expect(build(:deal)).to be_valid
    end

    it "is invalid without a title" do
      expect(build(:deal, title: "")).not_to be_valid
    end

    it "is invalid without a stage" do
      deal = build(:deal)
      deal.stage = nil
      expect(deal).not_to be_valid
    end

    it "is invalid with an unknown stage" do
      expect { build(:deal, stage: "bogus") }.to raise_error(ArgumentError)
    end

    it "is invalid with negative value_cents" do
      expect(build(:deal, value_cents: -1)).not_to be_valid
    end

    it "is valid with zero value_cents" do
      expect(build(:deal, value_cents: 0)).to be_valid
    end

    it "is valid with contact nil" do
      expect(build(:deal, contact: nil)).to be_valid
    end

    it "is valid with company nil" do
      expect(build(:deal, company: nil)).to be_valid
    end
  end

  describe "scopes" do
    let!(:lead)        { create(:deal, :lead) }
    let!(:qualified)   { create(:deal, :qualified) }
    let!(:proposal)    { create(:deal, :proposal) }
    let!(:closed_won)  { create(:deal, :closed_won) }
    let!(:closed_lost) { create(:deal, :closed_lost) }

    describe ".active" do
      it "returns open-stage deals" do
        expect(Deal.active).to include(lead, qualified, proposal)
      end

      it "excludes closed deals" do
        expect(Deal.active).not_to include(closed_won, closed_lost)
      end
    end

    describe ".open_deals" do
      it "returns lead, qualified, and proposal deals" do
        expect(Deal.open_deals).to include(lead, qualified, proposal)
      end

      it "excludes closed_won and closed_lost" do
        expect(Deal.open_deals).not_to include(closed_won, closed_lost)
      end
    end

    describe ".won" do
      it "returns only closed_won deals" do
        expect(Deal.won).to include(closed_won)
        expect(Deal.won).not_to include(lead, qualified, proposal, closed_lost)
      end
    end

    describe ".lost" do
      it "returns only closed_lost deals" do
        expect(Deal.lost).to include(closed_lost)
        expect(Deal.lost).not_to include(lead, qualified, proposal, closed_won)
      end
    end
  end

  describe "#value" do
    it "converts value_cents to dollars" do
      deal = build(:deal, value_cents: 12_500_00)
      expect(deal.value).to eq(12_500.0)
    end

    it "returns 0.0 for zero cents" do
      deal = build(:deal, value_cents: 0)
      expect(deal.value).to eq(0.0)
    end
  end

  describe "#open?" do
    it "returns true for lead" do
      expect(build(:deal, :lead).open?).to be true
    end

    it "returns true for qualified" do
      expect(build(:deal, :qualified).open?).to be true
    end

    it "returns true for proposal" do
      expect(build(:deal, :proposal).open?).to be true
    end

    it "returns false for closed_won" do
      expect(build(:deal, :closed_won).open?).to be false
    end

    it "returns false for closed_lost" do
      expect(build(:deal, :closed_lost).open?).to be false
    end
  end

  describe "#next_stage" do
    it "advances lead → qualified" do
      expect(build(:deal, :lead).next_stage).to eq("qualified")
    end

    it "advances qualified → proposal" do
      expect(build(:deal, :qualified).next_stage).to eq("proposal")
    end

    it "advances proposal → closed_won" do
      expect(build(:deal, :proposal).next_stage).to eq("closed_won")
    end

    it "advances closed_won → closed_lost" do
      expect(build(:deal, :closed_won).next_stage).to eq("closed_lost")
    end

    it "returns nil for closed_lost (final stage)" do
      expect(build(:deal, :closed_lost).next_stage).to be_nil
    end
  end

  describe "#as_deal_json" do
    let(:contact) { create(:contact, first_name: "Jane", last_name: "Smith") }
    let(:company) { create(:company, name: "Acme Corp") }
    let(:deal)    { create(:deal, title: "Big Deal", value_cents: 5_000_00, contact: contact, company: company) }

    subject(:json) { deal.as_deal_json }

    it "includes title" do
      expect(json["title"]).to eq("Big Deal")
    end

    it "includes value as dollars" do
      expect(json["value"]).to eq(5_000.0)
    end

    it "includes contact with id, first_name, last_name" do
      expect(json["contact"]).to include("id" => contact.id, "first_name" => "Jane", "last_name" => "Smith")
    end

    it "includes company with id and name" do
      expect(json["company"]).to include("id" => company.id, "name" => "Acme Corp")
    end

    it "excludes user_id" do
      expect(json).not_to have_key("user_id")
    end

    context "without contact or company" do
      let(:deal) { create(:deal, contact: nil, company: nil) }

      it "returns nil for contact" do
        expect(json["contact"]).to be_nil
      end

      it "returns nil for company" do
        expect(json["company"]).to be_nil
      end
    end
  end

  describe "associations" do
    it "destroys associated activities on destroy" do
      deal = create(:deal)
      activity = create(:activity, subject: deal)
      deal.destroy
      expect { activity.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
