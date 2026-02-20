# frozen_string_literal: true

class AddFieldsToCompanies < ActiveRecord::Migration[8.0]
  def change
    add_column :companies, :starred, :boolean, null: false, default: false
    add_column :companies, :phone,   :string
    add_column :companies, :email,   :string
    add_column :companies, :address, :string
    add_column :companies, :notes,   :text
    add_column :companies, :tags,    :json, null: false, default: []
  end
end
