# frozen_string_literal: true

class SearchController < ApplicationController
  def index
    q = params[:q].to_s.strip
    return render json: {results: []} if q.length < 2

    render json: {
      results: [
        {group: "Contacts",  items: search_contacts(q)},
        {group: "Companies", items: search_companies(q)},
        {group: "Deals",     items: search_deals(q)}
      ].reject { |g| g[:items].empty? }
    }
  end

  private

  def search_contacts(q)
    Current.user.contacts.active.search(q).limit(5).includes(:company).map do |c|
      {
        id:       c.id,
        type:     "contact",
        title:    c.full_name,
        subtitle: c.company&.name,
        starred:  c.starred,
        tags:     c.tags,
        url:      contact_path(c)
      }
    end
  end

  def search_companies(q)
    Current.user.companies.search(q).limit(5).map do |co|
      {
        id:       co.id,
        type:     "company",
        title:    co.name,
        subtitle: co.email || co.website,
        starred:  co.starred,
        tags:     co.tags,
        url:      company_path(co)
      }
    end
  end

  def search_deals(q)
    Current.user.deals.search(q).limit(5).includes(:contact, :company).map do |d|
      {
        id:       d.id,
        type:     "deal",
        title:    d.title,
        subtitle: d.contact&.full_name || d.company&.name,
        url:      deal_path(d)
      }
    end
  end
end
