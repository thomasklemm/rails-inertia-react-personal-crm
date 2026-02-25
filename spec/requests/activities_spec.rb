# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Activities", type: :request do
  let(:user) { create(:user) }
  let(:contact) { create(:contact, first_name: "Zara", last_name: "Ahmed", user: user) }
  let(:company) { create(:company, name: "Acme Corp", user: user) }

  before { sign_in_as(user) }

  describe "GET /activities" do
    it "renders the activity log page" do
      get activities_path
      expect(inertia).to render_component("activities/index")
    end

    context "searching by body text" do
      let!(:matching) { create(:activity, subject: contact, body: "Contract renewal discussed.", user: user) }
      let!(:other)    { create(:activity, subject: contact, body: "Unrelated topic.", user: user) }

      it "returns activities matching the query" do
        get activities_path, params: {q: "renewal"}
        bodies = inertia.props[:activities].map { |a| a["body"] }
        expect(bodies).to include("Contract renewal discussed.")
      end

      it "excludes activities not matching the query" do
        get activities_path, params: {q: "renewal"}
        bodies = inertia.props[:activities].map { |a| a["body"] }
        expect(bodies).not_to include("Unrelated topic.")
      end
    end

    context "searching by contact name" do
      let!(:zara_activity)  { create(:activity, subject: contact, body: "Follow-up call.", user: user) }
      let!(:other_contact)  { create(:contact, first_name: "Bob", last_name: "Smith", user: user) }
      let!(:bob_activity)   { create(:activity, subject: other_contact, body: "Initial meeting.", user: user) }

      it "returns activities whose contact first name matches" do
        get activities_path, params: {q: "Zara"}
        bodies = inertia.props[:activities].map { |a| a["body"] }
        expect(bodies).to include("Follow-up call.")
        expect(bodies).not_to include("Initial meeting.")
      end

      it "returns activities whose contact last name matches" do
        get activities_path, params: {q: "Ahmed"}
        bodies = inertia.props[:activities].map { |a| a["body"] }
        expect(bodies).to include("Follow-up call.")
        expect(bodies).not_to include("Initial meeting.")
      end

      it "returns activities matching a full name" do
        get activities_path, params: {q: "Zara Ahmed"}
        bodies = inertia.props[:activities].map { |a| a["body"] }
        expect(bodies).to include("Follow-up call.")
      end
    end

    context "searching by company name" do
      let!(:company_activity) { create(:activity, subject: company, body: "QBR completed.", user: user) }
      let!(:other_company)    { create(:company, name: "Beta Corp", user: user) }
      let!(:other_activity)   { create(:activity, subject: other_company, body: "Kick-off call.", user: user) }

      it "returns activities whose company name matches" do
        get activities_path, params: {q: "Acme"}
        bodies = inertia.props[:activities].map { |a| a["body"] }
        expect(bodies).to include("QBR completed.")
        expect(bodies).not_to include("Kick-off call.")
      end
    end

    context "multi-word search" do
      let!(:zara_activity)  { create(:activity, subject: contact, body: "Expansion plan agreed.", user: user) }
      let!(:other_contact)  { create(:contact, first_name: "Bob", last_name: "Smith", user: user) }
      let!(:bob_activity)   { create(:activity, subject: other_contact, body: "Kick-off meeting.", user: user) }

      it "matches when one word hits the subject name and another hits the body" do
        get activities_path, params: {q: "Zara expansion"}
        bodies = inertia.props[:activities].map { |a| a["body"] }
        expect(bodies).to include("Expansion plan agreed.")
        expect(bodies).not_to include("Kick-off meeting.")
      end

      it "excludes activities where not all words match" do
        # "Zara" matches Zara's subject name but "kick-off" is not in her activity body
        get activities_path, params: {q: "Zara kick-off"}
        bodies = inertia.props[:activities].map { |a| a["body"] }
        expect(bodies).not_to include("Expansion plan agreed.")
        expect(bodies).not_to include("Kick-off meeting.")
      end
    end

    context "filtering by kind" do
      let!(:note) { create(:activity, subject: contact, kind: "note", body: "A note.", user: user) }
      let!(:call) { create(:activity, subject: contact, kind: "call", body: "A call.", user: user) }

      it "returns only activities of the given kind" do
        get activities_path, params: {kind: "call"}
        bodies = inertia.props[:activities].map { |a| a["body"] }
        expect(bodies).to include("A call.")
        expect(bodies).not_to include("A note.")
      end

      it "ignores invalid kind values and returns all activities" do
        get activities_path, params: {kind: "tweet"}
        bodies = inertia.props[:activities].map { |a| a["body"] }
        expect(bodies).to include("A note.", "A call.")
      end
    end

    it "does not return activities belonging to other users" do
      other_user     = create(:user)
      other_contact  = create(:contact, user: other_user)
      create(:activity, subject: other_contact, body: "Private note.", user: other_user)

      get activities_path
      bodies = inertia.props[:activities].map { |a| a["body"] }
      expect(bodies).not_to include("Private note.")
    end
  end

  describe "POST /activities" do
    it "creates an activity for a contact and redirects to the contact page" do
      expect {
        post activities_path, params: {subject_type: "Contact", subject_id: contact.id, kind: "note", body: "Great meeting."}
      }.to change(Activity, :count).by(1)
      expect(response).to redirect_to(contact_path(contact))
    end

    it "creates an activity for a company and redirects to the company page" do
      expect {
        post activities_path, params: {subject_type: "Company", subject_id: company.id, kind: "call", body: "QBR done."}
      }.to change(Activity, :count).by(1)
      expect(response).to redirect_to(company_path(company))
    end

    it "does not create an activity with missing body" do
      expect {
        post activities_path, params: {subject_type: "Contact", subject_id: contact.id, kind: "note", body: ""}
      }.not_to change(Activity, :count)
    end

    it "does not allow creating an activity for another user's contact" do
      other_contact = create(:contact, user: create(:user))
      expect {
        post activities_path, params: {subject_type: "Contact", subject_id: other_contact.id, kind: "note", body: "Unauthorized."}
      }.not_to change(Activity, :count)
    end

    it "does not allow creating an activity for another user's company" do
      other_company = create(:company, user: create(:user))
      expect {
        post activities_path, params: {subject_type: "Company", subject_id: other_company.id, kind: "note", body: "Unauthorized."}
      }.not_to change(Activity, :count)
    end

    it "saves a custom occurred_at when provided" do
      past = 3.days.ago.change(usec: 0)
      post activities_path, params: {
        subject_type: "Contact", subject_id: contact.id,
        kind: "note", body: "Backdated note.",
        occurred_at: past.iso8601
      }
      activity = Activity.last
      expect(activity.occurred_at).to be_within(1.second).of(past)
    end
  end

  describe "PATCH /activities/:id" do
    let!(:activity) { create(:activity, subject: contact, kind: "note", body: "Original body.", user: user) }

    it "updates the body and kind" do
      patch activity_path(activity), params: {kind: "email", body: "Updated body.", subject_type: "Contact", subject_id: contact.id}
      expect(activity.reload.body).to eq("Updated body.")
      expect(activity.reload.kind).to eq("email")
    end

    it "updates occurred_at when provided" do
      new_time = 5.days.ago.change(usec: 0)
      patch activity_path(activity), params: {kind: "note", body: "Updated.", occurred_at: new_time.iso8601}
      expect(activity.reload.occurred_at).to be_within(1.second).of(new_time)
    end
  end

  describe "DELETE /activities/:id" do
    let!(:activity) { create(:activity, subject: contact, user: user) }

    it "deletes the activity" do
      expect {
        delete activity_path(activity)
      }.to change(Activity, :count).by(-1)
    end

    it "does not allow deleting another user's activity" do
      other_user     = create(:user)
      other_contact  = create(:contact, user: other_user)
      other_activity = create(:activity, subject: other_contact, user: other_user)

      expect {
        delete activity_path(other_activity)
      }.not_to change(Activity, :count)
    end
  end
end
