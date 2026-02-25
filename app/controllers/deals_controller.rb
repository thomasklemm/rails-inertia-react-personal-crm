# frozen_string_literal: true

class DealsController < InertiaController
  before_action :set_deal, only: [:show, :edit, :update, :destroy, :advance, :move]

  rescue_from ActiveRecord::RecordNotFound do
    redirect_to deals_path, notice: "Deal not found."
  end

  def index
    deals_by_stage = Deal::STAGES.index_with do |stage|
      Current.user.deals.where(stage: stage)
             .includes(:contact, :company)
             .order(:created_at)
             .map(&:as_deal_json)
    end

    render inertia: "deals/index", props: {
      deals_by_stage: deals_by_stage,
      pipeline_value: Current.user.deals.active.sum(:value_cents) / 100.0,
      stages: Deal::STAGES
    }
  end

  def show
    render inertia: "deals/show", props: {
      deal: @deal.as_deal_json,
      activities: @deal.activities.includes(:subject).order(created_at: :desc).map(&:as_activity_json)
    }
  end

  def new
    render inertia_modal: "deals/new", props: {
      stages:     Deal::STAGES,
      contact_id: params[:contact_id]&.to_i,
      company_id: params[:company_id]&.to_i,
      contacts:   Current.user.contacts.active.order(:last_name, :first_name)
                         .as_json(only: %w[id first_name last_name]),
      companies:  Current.user.companies.order(:name).as_json(only: %w[id name])
    }, base_url: deals_path
  end

  def create
    @deal = Current.user.deals.new(deal_params)
    if @deal.save
      redirect_to deal_path(@deal), notice: "Deal created."
    else
      redirect_to new_deal_path, inertia: {errors: @deal.errors.as_json}
    end
  end

  def edit
    render inertia_modal: "deals/edit", props: {
      deal:      @deal.as_deal_json,
      stages:    Deal::STAGES,
      contacts:  Current.user.contacts.active.order(:last_name, :first_name)
                         .as_json(only: %w[id first_name last_name]),
      companies: Current.user.companies.order(:name).as_json(only: %w[id name])
    }, base_url: deal_path(@deal)
  end

  def update
    if @deal.update(deal_params)
      redirect_to deal_path(@deal), notice: "Deal updated."
    else
      redirect_to edit_deal_path(@deal), inertia: {errors: @deal.errors.as_json}
    end
  end

  def destroy
    @deal.destroy
    redirect_to deals_path, notice: "Deal deleted."
  end

  def advance
    next_stage = @deal.next_stage
    if next_stage
      @deal.update!(stage: next_stage)
      redirect_back_or_to deal_path(@deal), notice: "Moved to #{next_stage.humanize}."
    else
      redirect_back_or_to deal_path(@deal), alert: "Deal is already in a final stage."
    end
  end

  def move
    unless Deal::STAGES.include?(params[:stage])
      return redirect_back_or_to deals_path, alert: "Invalid stage."
    end

    if @deal.update(stage: params[:stage])
      redirect_back_or_to deals_path, notice: "Stage updated."
    else
      redirect_back_or_to deals_path, alert: "Invalid stage."
    end
  end

  private

  def set_deal
    @deal = Current.user.deals.find(params[:id])
  end

  def deal_params
    p = params.permit(:title, :stage, :value, :notes, :contact_id, :company_id)
    p[:value_cents] = (p.delete(:value).to_f * 100).round if p.key?(:value)
    p
  end
end
