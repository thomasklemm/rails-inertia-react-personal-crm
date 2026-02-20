class CreateActivities < ActiveRecord::Migration[8.0]
  def change
    create_table :activities do |t|
      t.string :kind, null: false
      t.text   :body, null: false
      t.references :contact, null: false, foreign_key: true

      t.timestamps
    end
  end
end
