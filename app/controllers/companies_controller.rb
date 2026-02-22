# frozen_string_literal: true

class CompaniesController < InertiaController
  before_action :set_company, only: [:show, :edit, :update, :destroy, :star]

  def index
    render inertia: "companies/index", props: {
      companies: filtered_companies.as_json,
      q: params[:q],
      sort: params[:sort],
      sort_dir: params[:sort_dir],
      filter: params[:filter]
    }
  end

  def show
    render inertia: "companies/show", props: {
      companies: filtered_companies.as_json,
      company: @company.as_json,
      contacts: @company.contacts.includes(:company).order(:last_name, :first_name).as_json(include: :company),
      q: params[:q],
      sort: params[:sort],
      sort_dir: params[:sort_dir],
      filter: params[:filter],
      activities: (
        @company.activities.includes(:subject) +
        Current.user.activities.where(subject_type: "Contact", subject_id: @company.contacts.pluck(:id)).includes(:subject)
      ).sort_by(&:created_at).reverse.map(&:as_activity_json)
    }
  end

  def new
    render inertia_modal: "companies/new", props: {}, base_url: companies_path
  end

  def create
    @company = Current.user.companies.new(company_params)
    if @company.save
      redirect_to company_path(@company), notice: "Company created."
    else
      redirect_to new_company_path, inertia: { errors: @company.errors.as_json }
    end
  end

  def edit
    render inertia_modal: "companies/edit", props: {
      company: @company.as_json
    }, base_url: company_path(@company)
  end

  def update
    if @company.update(company_params)
      redirect_to company_path(@company), notice: "Company updated."
    else
      redirect_to edit_company_path(@company), inertia: { errors: @company.errors.as_json }
    end
  end

  def destroy
    @company.destroy
    redirect_to companies_path, notice: "Company deleted."
  end

  def star
    @company.update!(starred: !@company.starred)
    redirect_back_or_to company_path(@company), notice: @company.starred? ? "Starred." : "Unstarred."
  end

  private

  def set_company
    @company = Current.user.companies.find(params[:id])
  end

  def company_params
    params.permit(:name, :website, :phone, :email, :address, :notes, tags: [])
  end

  def filtered_companies
    scope = Current.user.companies.left_joins(:contacts)
                   .group(:id)
                   .select("companies.*, COUNT(contacts.id) AS contacts_count")
                   .order(:name)

    scope = scope.where(starred: true) if params[:filter] == "starred"
    scope = scope.search(params[:q]) if params[:q].present?

    dir = params[:sort_dir] == "desc" ? :desc : :asc

    scope = case params[:sort]
            when "added"
              scope.reorder(created_at: dir)
            when "contacts"
              scope.reorder(Arel.sql("contacts_count #{dir == :desc ? 'DESC' : 'ASC'}, companies.name"))
            else
              dir == :desc ? scope.reorder(name: :desc) : scope
            end

    scope
  end
end
