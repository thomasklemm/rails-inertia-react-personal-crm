# frozen_string_literal: true

class CompaniesController < InertiaController
  before_action :set_company, only: [:show, :edit, :update, :destroy]

  def index
    render inertia: "companies/index", props: {
      companies: filtered_companies.as_json,
      q: params[:q],
      sort: params[:sort],
      sort_dir: params[:sort_dir]
    }
  end

  def show
    render inertia: "companies/show", props: {
      companies: filtered_companies.as_json,
      company: @company.as_json,
      contacts: @company.contacts.includes(:company).order(:last_name, :first_name).as_json(include: :company),
      q: params[:q],
      sort: params[:sort],
      sort_dir: params[:sort_dir]
    }
  end

  def new
    render inertia: "companies/new", props: {
      companies: filtered_companies.as_json,
      q: params[:q],
      sort: params[:sort],
      sort_dir: params[:sort_dir]
    }
  end

  def create
    @company = Company.new(company_params)
    if @company.save
      redirect_to company_path(@company), notice: "Company created."
    else
      redirect_to new_company_path, inertia: { errors: @company.errors.as_json }
    end
  end

  def edit
    render inertia: "companies/edit", props: {
      companies: filtered_companies.as_json,
      company: @company.as_json,
      q: params[:q],
      sort: params[:sort],
      sort_dir: params[:sort_dir]
    }
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

  private

  def set_company
    @company = Company.find(params[:id])
  end

  def company_params
    params.permit(:name, :website)
  end

  def filtered_companies
    scope = Company.left_joins(:contacts)
                   .group(:id)
                   .select("companies.*, COUNT(contacts.id) AS contacts_count")
                   .order(:name)

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
