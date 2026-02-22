# frozen_string_literal: true

class CreateContacts < ActiveRecord::Migration[8.0]
  def change
    create_table :contacts do |t|
      t.references :user, null: false, foreign_key: true
      t.string  :first_name, null: false
      t.string  :last_name,  null: false
      t.string  :email
      t.string  :phone
      t.text    :notes
      t.boolean :starred,  null: false, default: false
      t.boolean :archived, null: false, default: false
      t.json    :tags,     null: false, default: []
      t.references :company, foreign_key: true

      t.timestamps
    end
  end
end
