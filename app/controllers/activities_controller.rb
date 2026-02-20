# frozen_string_literal: true

class ActivitiesController < InertiaController
  before_action :set_activity, only: [:show, :edit, :update, :destroy]

  def index
    scope = Activity.includes(contact: :company).order(created_at: :desc)

    if params[:q].present?
      q = "%#{params[:q]}%"
      scope = scope.where("activities.body LIKE ?", q)
    end

    if params[:kind].present? && Activity::KINDS.include?(params[:kind])
      scope = scope.where(kind: params[:kind])
    end

    render inertia: "activities/index", props: {
      activities: scope.as_json(include: { contact: { only: [:id, :first_name, :last_name] } }),
      q: params[:q],
      kind: params[:kind]
    }
  end

  def show
    render inertia: "activities/show", props: {
      activity: @activity.as_json(include: { contact: { only: [:id, :first_name, :last_name] } })
    }
  end

  def create
    @activity = Activity.new(activity_params)
    if @activity.save
      redirect_to contact_path(@activity.contact), notice: "Activity logged."
    else
      redirect_back_or_to contacts_path, inertia: { errors: @activity.errors.as_json }
    end
  end

  def edit
    render inertia: "activities/edit", props: {
      activity: @activity.as_json(include: { contact: { only: [:id, :first_name, :last_name] } })
    }
  end

  def update
    if @activity.update(activity_params)
      redirect_back_or_to contact_path(@activity.contact), notice: "Activity updated."
    else
      redirect_to edit_activity_path(@activity), inertia: { errors: @activity.errors.as_json }
    end
  end

  def destroy
    contact = @activity.contact
    @activity.destroy
    redirect_back_or_to contact_path(contact), notice: "Activity deleted."
  end

  private

  def set_activity
    @activity = Activity.find(params[:id])
  end

  def activity_params
    params.permit(:kind, :body, :contact_id)
  end
end
