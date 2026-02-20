# frozen_string_literal: true

class CompaniesController < InertiaController
  before_action :set_company, only: [:show, :edit, :update, :destroy]

  def index
    render inertia: "companies/index", props: {
      companies: Company.order(:name).map { |c|
        c.as_json.merge(contacts_count: c.contacts.count)
      }
    }
  end

  def show
    render inertia: "companies/show", props: {
      company: @company.as_json,
      contacts: @company.contacts.includes(:company).order(:last_name, :first_name).as_json(include: :company)
    }
  end

  def new
    render inertia: "companies/new", props: {}
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
      company: @company.as_json
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
end
