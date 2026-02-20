# frozen_string_literal: true

require "rails_helper"

RSpec.describe Company, type: :model do
  describe "validations" do
    it "is valid with a name" do
      expect(build(:company)).to be_valid
    end

    it "is invalid without a name" do
      expect(build(:company, name: "")).not_to be_valid
    end
  end

  describe "associations" do
    it "has many contacts" do
      company = create(:company)
      contact = create(:contact, company: company)
      expect(company.contacts).to include(contact)
    end

    it "nullifies contacts on destroy" do
      company = create(:company)
      contact = create(:contact, company: company)
      company.destroy
      expect(contact.reload.company).to be_nil
    end
  end

  describe "#to_s" do
    it "returns the name" do
      expect(build(:company, name: "Acme").to_s).to eq("Acme")
    end
  end
end
