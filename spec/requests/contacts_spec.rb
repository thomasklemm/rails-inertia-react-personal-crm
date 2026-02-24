# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Contacts", type: :request do
  let(:user) { create(:user) }

  before { sign_in_as(user) }

  describe "GET /contacts" do
    it "renders the contacts index" do
      get contacts_path
      expect(inertia).to render_component("contacts/index")
    end

    context "with filter=follow_up" do
      let!(:overdue)   { create(:contact, user:, follow_up_at: Date.current - 1) }
      let!(:upcoming)  { create(:contact, user:, follow_up_at: Date.current + 7) }
      let!(:no_follow) { create(:contact, user:) }
      let!(:archived)  { create(:contact, :archived, user:, follow_up_at: Date.current - 1) }

      it "returns only active overdue contacts" do
        get contacts_path(filter: "follow_up")
        ids = inertia.props[:contacts].map { |c| c["id"] }
        expect(ids).to include(overdue.id)
        expect(ids).not_to include(upcoming.id, no_follow.id, archived.id)
      end

      it "orders results by follow_up_at ascending" do
        earlier = create(:contact, user:, follow_up_at: Date.current - 3)
        get contacts_path(filter: "follow_up")
        ids = inertia.props[:contacts].map { |c| c["id"] }
        expect(ids.index(earlier.id)).to be < ids.index(overdue.id)
      end
    end
  end

  describe "GET /contacts/:id" do
    let(:company) { create(:company, user:) }
    let(:contact) { create(:contact, user:, company: company) }

    it "renders contacts/show" do
      get contact_path(contact)
      expect(inertia).to render_component("contacts/show")
    end

    it "includes companies list in props" do
      company # ensure created
      get contact_path(contact)
      company_ids = inertia.props[:companies].map { |c| c["id"] }
      expect(company_ids).to include(company.id)
    end

    it "includes nested company data in contact prop" do
      get contact_path(contact)
      contact_prop = inertia.props[:contact]
      expect(contact_prop["company"]).to be_present
      expect(contact_prop["company"]["id"]).to eq(company.id)
      expect(contact_prop["company"]["name"]).to eq(company.name)
    end
  end

  describe "PATCH /contacts/:id" do
    let(:contact) { create(:contact, user:) }

    it "persists follow_up_at" do
      patch contact_path(contact), params: {follow_up_at: "2026-03-15"}
      expect(contact.reload.follow_up_at).to eq(Date.new(2026, 3, 15))
    end

    it "clears follow_up_at when sent as empty string" do
      contact.update!(follow_up_at: Date.current + 7)
      patch contact_path(contact), params: {follow_up_at: ""}
      expect(contact.reload.follow_up_at).to be_nil
    end

    context "company association" do
      let(:company) { create(:company, user:) }

      it "associates a company" do
        patch contact_path(contact), params: {company_id: company.id}
        expect(contact.reload.company).to eq(company)
      end

      it "disassociates a company with nil" do
        contact.update!(company: company)
        patch contact_path(contact), params: {company_id: nil}
        expect(contact.reload.company).to be_nil
      end

      it "disassociates a company with blank string" do
        contact.update!(company: company)
        patch contact_path(contact), params: {company_id: ""}
        expect(contact.reload.company).to be_nil
      end
    end
  end
end
