# frozen_string_literal: true

class CreateDeals < ActiveRecord::Migration[8.1]
  def change
    create_table :deals do |t|
      t.string   :title,       null: false
      t.string   :stage,       null: false, default: "lead"
      t.integer  :value_cents, null: false, default: 0
      t.date     :closed_at
      t.text     :notes
      t.references :user,    null: false, foreign_key: true
      t.references :contact, null: true,  foreign_key: true
      t.references :company, null: true,  foreign_key: true
      t.timestamps
    end
    add_index :deals, :stage
  end
end
