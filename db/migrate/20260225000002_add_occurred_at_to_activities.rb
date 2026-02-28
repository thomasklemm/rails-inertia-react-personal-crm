# frozen_string_literal: true

class AddOccurredAtToActivities < ActiveRecord::Migration[8.1]
  def change
    add_column :activities, :occurred_at, :datetime
    add_index  :activities, :occurred_at
  end
end
