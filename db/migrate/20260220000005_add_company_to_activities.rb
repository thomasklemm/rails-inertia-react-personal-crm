# frozen_string_literal: true

class AddCompanyToActivities < ActiveRecord::Migration[8.0]
  def change
    change_column_null :activities, :contact_id, true
    add_column :activities, :company_id, :integer
    add_index  :activities, :company_id
    add_foreign_key :activities, :companies
  end
end
