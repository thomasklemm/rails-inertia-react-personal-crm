# frozen_string_literal: true

require "rails_helper"

RSpec.describe Activity, type: :model do
  describe "validations" do
    it "is valid with kind, body, and subject" do
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
    it "belongs to a contact as subject" do
      contact = create(:contact)
      activity = create(:activity, subject: contact)
      expect(activity.subject).to eq(contact)
      expect(activity.subject_type).to eq("Contact")
    end

    it "belongs to a company as subject" do
      company = create(:company)
      activity = create(:activity, subject: company)
      expect(activity.subject).to eq(company)
      expect(activity.subject_type).to eq("Company")
    end
  end

  describe "default scope" do
    it "orders by created_at desc" do
      contact = create(:contact)
      old    = create(:activity, subject: contact, created_at: 2.days.ago)
      recent = create(:activity, subject: contact, created_at: 1.hour.ago)
      expect(Activity.where(subject: contact).first).to eq(recent)
    end
  end

  describe "#subject_json" do
    it "returns id, type, and full name for a contact subject" do
      contact = create(:contact, first_name: "Jane", last_name: "Doe")
      activity = create(:activity, subject: contact)
      json = activity.subject_json
      expect(json).to eq({ id: contact.id, type: "Contact", name: "Jane Doe" })
    end

    it "returns id, type, and name for a company subject" do
      company = create(:company, name: "Acme Corp")
      activity = create(:activity, subject: company)
      json = activity.subject_json
      expect(json).to eq({ id: company.id, type: "Company", name: "Acme Corp" })
    end
  end

  describe "#as_activity_json" do
    it "includes subject and excludes raw FK columns" do
      contact = create(:contact, first_name: "Jane", last_name: "Doe")
      activity = create(:activity, subject: contact)
      json = activity.as_activity_json
      expect(json).to include("subject" => { id: contact.id, type: "Contact", name: "Jane Doe" })
      expect(json.keys).not_to include("subject_type", "subject_id", "user_id")
      expect(json).to include("id", "kind", "body", "created_at", "updated_at")
    end
  end
end
