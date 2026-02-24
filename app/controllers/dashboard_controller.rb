# frozen_string_literal: true

class DashboardController < InertiaController
  def show
    render inertia: "dashboard/show", props: {
      stats: {
        contacts_count: Current.user.contacts.active.count,
        companies_count: Current.user.companies.count,
        activities_this_week: Current.user.activities.where(created_at: Time.current.beginning_of_week..).count
      },
      recent_activities: Current.user.activities.includes(:subject).limit(20).map(&:as_activity_json),
      starred_contacts: Current.user.contacts.active.starred.order(:last_name, :first_name).limit(8).as_json(include: :company),
      due_follow_ups: Current.user.contacts.active.due_follow_up.order(follow_up_at: :asc).as_json(include: :company)
    }
  end
end
