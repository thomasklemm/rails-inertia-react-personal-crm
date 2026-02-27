# frozen_string_literal: true

class DashboardController < InertiaController
  def show
    open_deals_scope = Current.user.deals.where(stage: %w[lead qualified proposal])

    render inertia: "dashboard/show", props: {
      stats: {
        contacts_count: Current.user.contacts.active.count,
        companies_count: Current.user.companies.count,
        activities_this_week: Current.user.activities.where(created_at: Time.current.beginning_of_week..).count,
        deals_count: open_deals_scope.count,
        pipeline_value: Current.user.deals.active.sum(:value_cents) / 100.0
      },
      open_deals: open_deals_scope
                    .includes(:contact, :company)
                    .order(:stage, :created_at)
                    .map(&:as_deal_json),
      recent_activities: Current.user.activities.includes(:subject).limit(20).map(&:as_activity_json),
      starred_contacts: Current.user.contacts.active.starred.order(:last_name, :first_name).limit(8).as_json(include: :company),
      due_follow_ups: Current.user.contacts.active.due_follow_up.order(follow_up_at: :asc).as_json(include: :company),
      subjects: subject_options
    }
  end

  private

  def subject_options
    contacts = Current.user.contacts.active.order(:last_name, :first_name)
      .map { |c| {id: c.id, type: "Contact", name: "#{c.first_name} #{c.last_name}"} }
    companies = Current.user.companies.order(:name)
      .map { |c| {id: c.id, type: "Company", name: c.name} }
    deals = Current.user.deals.active.order(:title)
      .map { |d| {id: d.id, type: "Deal", name: d.title} }
    contacts + companies + deals
  end
end
