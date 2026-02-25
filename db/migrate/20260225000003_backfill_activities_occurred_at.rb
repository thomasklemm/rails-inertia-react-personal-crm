# frozen_string_literal: true

class BackfillActivitiesOccurredAt < ActiveRecord::Migration[8.1]
  def up
    Activity.in_batches.update_all("occurred_at = created_at")
  end

  def down
    # Backfill is not reversible in a meaningful way
  end
end
