# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Dashboard", type: :request do
  let(:user) { create(:user) }

  describe "GET /dashboard" do
    context "when unauthenticated" do
      it "redirects to sign-in" do
        get dashboard_path
        expect(response).to redirect_to(sign_in_path)
      end
    end

    context "when authenticated" do
      before { sign_in_as(user) }

      it "renders the dashboard/show Inertia component" do
        get dashboard_path
        expect(inertia).to render_component("dashboard/show")
      end

      it "includes stats with contacts_count, companies_count, and activities_this_week" do
        create_list(:contact, 2, user:)
        create(:company, user:)
        create(:activity, user:, subject: create(:contact, user:), created_at: Time.current)

        get dashboard_path
        stats = inertia.props[:stats]
        expect(stats["contacts_count"]).to eq(3)
        expect(stats["companies_count"]).to eq(1)
        expect(stats["activities_this_week"]).to eq(1)
      end

      it "excludes archived contacts from stats.contacts_count" do
        create(:contact, user:)
        create(:contact, :archived, user:)

        get dashboard_path
        stats = inertia.props[:stats]
        expect(stats["contacts_count"]).to eq(1)
      end

      it "limits recent_activities to 20" do
        contact = create(:contact, user:)
        create_list(:activity, 25, user:, subject: contact)

        get dashboard_path
        expect(inertia.props[:recent_activities].length).to eq(20)
      end

      it "limits starred_contacts to 8" do
        create_list(:contact, 10, :starred, user:)

        get dashboard_path
        expect(inertia.props[:starred_contacts].length).to eq(8)
      end

      it "only includes contacts with follow_up_at <= today in due_follow_ups" do
        overdue = create(:contact, user:, follow_up_at: Date.current - 1)
        today = create(:contact, user:, follow_up_at: Date.current)
        future = create(:contact, user:, follow_up_at: Date.current + 3)
        no_follow = create(:contact, user:)

        get dashboard_path
        ids = inertia.props[:due_follow_ups].map { |c| c["id"] }
        expect(ids).to include(overdue.id, today.id)
        expect(ids).not_to include(future.id, no_follow.id)
      end

      it "excludes archived contacts from due_follow_ups" do
        create(:contact, :archived, user:, follow_up_at: Date.current - 1)
        active = create(:contact, user:, follow_up_at: Date.current)

        get dashboard_path
        ids = inertia.props[:due_follow_ups].map { |c| c["id"] }
        expect(ids).to include(active.id)
        expect(ids).to eq([active.id])
      end
    end
  end
end
