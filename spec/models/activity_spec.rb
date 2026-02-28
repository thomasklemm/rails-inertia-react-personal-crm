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

    it "rejects subject_type values outside Contact and Company" do
      activity = build(:activity)
      activity.subject_type = "User"
      expect(activity).not_to be_valid
      expect(activity.errors[:subject_type]).to be_present
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
    it "orders by occurred_at desc" do
      contact = create(:contact)
      old    = create(:activity, subject: contact, occurred_at: 2.days.ago)
      recent = create(:activity, subject: contact, occurred_at: 1.hour.ago)
      expect(Activity.where(subject: contact).first).to eq(recent)
    end
  end

  describe "occurred_at" do
    it "defaults occurred_at to the current time when not provided" do
      contact = create(:contact)
      activity = create(:activity, subject: contact)
      expect(activity.occurred_at).to be_present
      expect(activity.occurred_at).to be_within(5.seconds).of(Time.current)
    end

    it "uses explicitly set occurred_at when provided" do
      contact = create(:contact)
      past = 3.days.ago
      activity = create(:activity, subject: contact, occurred_at: past)
      expect(activity.occurred_at).to be_within(1.second).of(past)
    end
  end

  describe "#as_activity_json" do
    it "includes contact subject with full name and excludes raw FK columns" do
      contact = create(:contact, first_name: "Jane", last_name: "Doe")
      activity = create(:activity, subject: contact)
      json = activity.as_activity_json
      expect(json).to include("subject" => {id: contact.id, type: "Contact", name: "Jane Doe"})
      expect(json.keys).not_to include("subject_type", "subject_id", "user_id")
      expect(json).to include("id", "kind", "body", "created_at", "updated_at")
    end

    it "includes occurred_at in the JSON output" do
      contact = create(:contact)
      past = 3.days.ago
      activity = create(:activity, subject: contact, occurred_at: past)
      json = activity.as_activity_json
      expect(json).to include("occurred_at")
      expect(Time.parse(json["occurred_at"])).to be_within(1.second).of(past)
    end

    it "includes company subject with name and excludes raw FK columns" do
      company = create(:company, name: "Acme Corp")
      activity = create(:activity, subject: company)
      json = activity.as_activity_json
      expect(json).to include("subject" => {id: company.id, type: "Company", name: "Acme Corp"})
      expect(json.keys).not_to include("subject_type", "subject_id", "user_id")
    end
  end
end
