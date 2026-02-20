# frozen_string_literal: true

require "rails_helper"

RSpec.describe Activity, type: :model do
  describe "validations" do
    it "is valid with kind, body, and contact" do
      expect(build(:activity)).to be_valid
    end

    it "is invalid without a body" do
      expect(build(:activity, body: "")).not_to be_valid
    end

    it "is invalid with an invalid kind" do
      expect { build(:activity, kind: "tweet") }.to raise_error(ArgumentError)
    end

    it "accepts note, call, email kinds" do
      %w[note call email].each do |kind|
        expect(build(:activity, kind: kind)).to be_valid
      end
    end
  end

  describe "associations" do
    it "belongs to a contact" do
      contact = create(:contact)
      activity = create(:activity, contact: contact)
      expect(activity.contact).to eq(contact)
    end
  end

  describe "default scope" do
    it "orders by created_at desc" do
      contact = create(:contact)
      old = create(:activity, contact: contact, created_at: 2.days.ago)
      recent = create(:activity, contact: contact, created_at: 1.hour.ago)
      expect(Activity.where(contact: contact).first).to eq(recent)
    end
  end
end
