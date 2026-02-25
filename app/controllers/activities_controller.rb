# frozen_string_literal: true

class ActivitiesController < InertiaController
  before_action :set_activity, only: [:show, :edit, :update, :destroy]
  before_action :authorize_subject, only: [:create]

  def index
    scope = Current.user.activities.includes(:subject).order(created_at: :desc)

    if params[:q].present?
      scope = scope
        .joins("LEFT JOIN contacts ON activities.subject_type = 'Contact' AND activities.subject_id = contacts.id")
        .joins("LEFT JOIN companies ON activities.subject_type = 'Company' AND activities.subject_id = companies.id")
        .joins("LEFT JOIN deals ON activities.subject_type = 'Deal' AND activities.subject_id = deals.id")
      params[:q].split.each do |word|
        w = "%#{word}%"
        scope = scope.where(
          "activities.body LIKE :w OR (contacts.first_name || ' ' || contacts.last_name) LIKE :w OR companies.name LIKE :w OR deals.title LIKE :w",
          w: w
        )
      end
    end

    if params[:kind].present? && Activity::KINDS.include?(params[:kind])
      scope = scope.where(kind: params[:kind])
    end

    if params[:subject].present?
      case params[:subject]
      when "contact"
        scope = scope.where(subject_type: "Contact")
      when "company"
        scope = scope.where(subject_type: "Company")
      when "deal"
        scope = scope.where(subject_type: "Deal")
      end
    end

    render inertia: "activities/index", props: {
      activities: scope.map(&:as_activity_json),
      q: params[:q],
      kind: params[:kind],
      subject: params[:subject]
    }
  end

  def show
    render inertia: "activities/show", props: {
      activity: @activity.as_activity_json
    }
  end

  def create
    @activity = Current.user.activities.new(activity_params)
    if @activity.save
      redirect_to url_for(@activity.subject), notice: "Activity logged."
    else
      redirect_back_or_to contacts_path, inertia: {errors: @activity.errors.as_json}
    end
  end

  def new
    render inertia_modal: "activities/new", props: {
      subject_type: params[:subject_type],
      subject_id: params[:subject_id]&.to_i
    }, base_url: activities_path
  end

  def edit
    render inertia_modal: "activities/edit", props: {
      activity: @activity.as_activity_json
    }, base_url: activities_path
  end

  def update
    if @activity.update(activity_update_params)
      redirect_back_or_to activities_path, notice: "Activity updated."
    else
      redirect_to edit_activity_path(@activity), inertia: {errors: @activity.errors.as_json}
    end
  end

  def destroy
    redirect_path = url_for(@activity.subject)
    @activity.destroy
    redirect_back_or_to redirect_path, notice: "Activity deleted."
  end

  private

  def set_activity
    @activity = Current.user.activities.includes(:subject).find(params[:id])
  end

  def authorize_subject
    case params[:subject_type]
    when "Contact"
      Current.user.contacts.find(params[:subject_id])
    when "Company"
      Current.user.companies.find(params[:subject_id])
    when "Deal"
      Current.user.deals.find(params[:subject_id])
    else
      raise ActiveRecord::RecordNotFound
    end
  end

  def activity_params
    params.permit(:kind, :body, :subject_type, :subject_id)
  end

  def activity_update_params
    params.permit(:kind, :body)
  end
end
