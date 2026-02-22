# frozen_string_literal: true

class CreateActivities < ActiveRecord::Migration[8.0]
  def change
    create_table :activities do |t|
      t.references :user, null: false, foreign_key: true
      t.string :kind, null: false
      t.text   :body, null: false
      t.references :contact, foreign_key: true

      t.timestamps
    end
  end
end
