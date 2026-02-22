# frozen_string_literal: true

class MigrateActivitiesToPolymorphicSubject < ActiveRecord::Migration[8.1]
  def up
    # Add new columns nullable first so we can populate them
    add_column :activities, :subject_type, :string
    add_column :activities, :subject_id, :integer

    # Migrate existing data: contact takes precedence when both are set
    execute <<~SQL
      UPDATE activities SET subject_type = 'Contact', subject_id = contact_id WHERE contact_id IS NOT NULL
    SQL
    execute <<~SQL
      UPDATE activities SET subject_type = 'Company', subject_id = company_id WHERE contact_id IS NULL AND company_id IS NOT NULL
    SQL

    change_column_null :activities, :subject_type, false
    change_column_null :activities, :subject_id, false

    add_index :activities, [:subject_type, :subject_id]

    remove_foreign_key :activities, :contacts
    remove_foreign_key :activities, :companies
    remove_column :activities, :contact_id
    remove_column :activities, :company_id
  end

  def down
    add_column :activities, :contact_id, :integer
    add_column :activities, :company_id, :integer

    execute <<~SQL
      UPDATE activities SET contact_id = subject_id WHERE subject_type = 'Contact'
    SQL
    execute <<~SQL
      UPDATE activities SET company_id = subject_id WHERE subject_type = 'Company'
    SQL

    add_index :activities, :contact_id
    add_index :activities, :company_id
    add_foreign_key :activities, :contacts
    add_foreign_key :activities, :companies

    remove_index :activities, [:subject_type, :subject_id]
    remove_column :activities, :subject_type
    remove_column :activities, :subject_id
  end
end
