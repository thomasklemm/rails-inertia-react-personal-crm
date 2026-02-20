# frozen_string_literal: true

class ActivitiesController < InertiaController
  before_action :set_activity, only: [:show, :edit, :update, :destroy]

  def index
    scope = Current.user.activities.includes(contact: :company).order(created_at: :desc)

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
    @activity = Current.user.activities.new(activity_params)
    if @activity.save
      if @activity.company_id?
        redirect_to company_path(@activity.company), notice: "Activity logged."
      else
        redirect_to contact_path(@activity.contact), notice: "Activity logged."
      end
    else
      redirect_back_or_to contacts_path, inertia: { errors: @activity.errors.as_json }
    end
  end

  def edit
    render inertia: "activities/edit", props: {
      activity: @activity.as_json(include: {
        contact: { only: [:id, :first_name, :last_name] },
        company: { only: [:id, :name] }
      }),
      return_to: params[:return_to]
    }
  end

  def update
    if @activity.update(activity_params)
      redirect_path = if @activity.company_id?
                        company_path(@activity.company)
                      else
                        contact_path(@activity.contact)
                      end
      redirect_to safe_return_path(params[:return_to], redirect_path), notice: "Activity updated."
    else
      redirect_to edit_activity_path(@activity, return_to: params[:return_to]), inertia: { errors: @activity.errors.as_json }
    end
  end

  def destroy
    redirect_path = if @activity.company_id?
                      company_path(@activity.company)
                    else
                      contact_path(@activity.contact)
                    end
    @activity.destroy
    redirect_back_or_to redirect_path, notice: "Activity deleted."
  end

  private

  def set_activity
    @activity = Current.user.activities.find(params[:id])
  end

  def activity_params
    params.permit(:kind, :body, :contact_id, :company_id)
  end
end
