# frozen_string_literal: true

require "rails_helper"

RSpec.describe Contact, type: :model do
  describe "validations" do
    it "is valid with first_name and last_name" do
      expect(build(:contact)).to be_valid
    end

    it "is invalid without first_name" do
      expect(build(:contact, first_name: "")).not_to be_valid
    end

    it "is invalid without last_name" do
      expect(build(:contact, last_name: "")).not_to be_valid
    end

    it "is valid with valid tags" do
      expect(build(:contact, tags: %w[customer vip])).to be_valid
    end

    it "is invalid with invalid tags" do
      expect(build(:contact, tags: %w[bogus])).not_to be_valid
    end
  end

  describe "scopes" do
    let!(:active)   { create(:contact) }
    let!(:starred)  { create(:contact, :starred) }
    let!(:archived) { create(:contact, :archived) }

    it ".active returns non-archived contacts" do
      expect(Contact.active).to include(active, starred)
      expect(Contact.active).not_to include(archived)
    end

    it ".starred returns starred contacts" do
      expect(Contact.starred).to include(starred)
      expect(Contact.starred).not_to include(active, archived)
    end

    it ".archived returns archived contacts" do
      expect(Contact.archived).to include(archived)
      expect(Contact.archived).not_to include(active, starred)
    end
  end

  describe ".search" do
    let!(:john) { create(:contact, first_name: "John", last_name: "Doe", email: "john@example.com") }
    let!(:jane) { create(:contact, first_name: "Jane", last_name: "Smith", email: "jane@other.com") }

    it "matches on first_name" do
      expect(Contact.search("John")).to include(john)
      expect(Contact.search("John")).not_to include(jane)
    end

    it "matches on last_name" do
      expect(Contact.search("Smith")).to include(jane)
      expect(Contact.search("Smith")).not_to include(john)
    end

    it "matches on email" do
      expect(Contact.search("other.com")).to include(jane)
      expect(Contact.search("other.com")).not_to include(john)
    end
  end

  describe "#full_name" do
    it "returns first and last name" do
      contact = build(:contact, first_name: "Ada", last_name: "Lovelace")
      expect(contact.full_name).to eq("Ada Lovelace")
    end
  end

  describe "associations" do
    it "belongs to an optional company" do
      expect(build(:contact, company: nil)).to be_valid
    end

    it "destroys activities on destroy" do
      contact = create(:contact)
      activity = create(:activity, contact: contact)
      contact.destroy
      expect { activity.reload }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
