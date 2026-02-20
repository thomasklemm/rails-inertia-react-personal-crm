# frozen_string_literal: true

class ContactsController < InertiaController
  before_action :set_contact, only: [:show, :edit, :update, :destroy, :star, :archive]

  def index
    render inertia: "contacts/index", props: {
      contacts: filtered_contacts.as_json(include: :company),
      q: params[:q],
      filter: params[:filter],
      sort: params[:sort],
      sort_dir: params[:sort_dir]
    }
  end

  def show
    render inertia: "contacts/show", props: {
      contacts: filtered_contacts.as_json(include: :company),
      contact: @contact.as_json(include: :company),
      activities: @contact.activities.as_json(include: { contact: { only: [:id, :first_name, :last_name] } }),
      companies: Current.user.companies.order(:name).as_json,
      q: params[:q],
      filter: params[:filter],
      sort: params[:sort],
      sort_dir: params[:sort_dir]
    }
  end

  def new
    render inertia: "contacts/new", props: {
      contacts: filtered_contacts.as_json(include: :company),
      companies: Current.user.companies.order(:name).as_json,
      q: params[:q],
      filter: params[:filter],
      sort: params[:sort],
      sort_dir: params[:sort_dir]
    }
  end

  def create
    @contact = Current.user.contacts.new(contact_params)
    if @contact.save
      redirect_to contact_path(@contact), notice: "Contact created."
    else
      redirect_to new_contact_path, inertia: { errors: @contact.errors.as_json }
    end
  end

  def edit
    render inertia: "contacts/edit", props: {
      contacts: filtered_contacts.as_json(include: :company),
      contact: @contact.as_json(include: :company),
      companies: Current.user.companies.order(:name).as_json,
      q: params[:q],
      filter: params[:filter],
      sort: params[:sort],
      sort_dir: params[:sort_dir]
    }
  end

  def update
    if @contact.update(contact_params)
      redirect_to contact_path(@contact), notice: "Contact updated."
    else
      redirect_to edit_contact_path(@contact), inertia: { errors: @contact.errors.as_json }
    end
  end

  def destroy
    @contact.destroy
    redirect_to contacts_path, notice: "Contact deleted."
  end

  def star
    @contact.update!(starred: !@contact.starred)
    redirect_back_or_to contact_path(@contact), notice: @contact.starred? ? "Starred." : "Unstarred."
  end

  def archive
    @contact.update!(archived: !@contact.archived)
    redirect_back_or_to contacts_path, notice: @contact.archived? ? "Archived." : "Restored."
  end

  private

  def set_contact
    @contact = Current.user.contacts.includes(:company, :activities).find(params[:id])
  end

  def contact_params
    params.permit(:first_name, :last_name, :email, :phone, :notes, :company_id, tags: [])
  end

  def filtered_contacts
    scope = Current.user.contacts.includes(:company).order(:last_name, :first_name)

    scope = case params[:filter]
            when "starred"  then scope.where(starred: true)
            when "archived" then scope.where(archived: true)
            else                 scope.where(archived: false)
            end

    if params[:q].present?
      scope = scope.search(params[:q])
    end

    dir = params[:sort_dir] == "desc" ? :desc : :asc

    scope = case params[:sort]
            when "added"
              scope.reorder(created_at: dir)
            when "company"
              dir_sql = dir == :desc ? "DESC" : "ASC"
              scope.joins("LEFT JOIN companies ON companies.id = contacts.company_id")
                   .reorder(Arel.sql("companies.name #{dir_sql} NULLS LAST, contacts.last_name #{dir_sql}"))
            else
              dir == :desc ? scope.reorder(last_name: :desc, first_name: :desc) : scope
            end

    scope
  end
end
