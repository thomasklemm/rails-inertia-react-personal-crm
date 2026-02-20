class Activity < ApplicationRecord
  KINDS = %w[note call email].freeze

  belongs_to :contact

  enum :kind, note: "note", call: "call", email: "email"

  validates :kind, presence: true, inclusion: { in: KINDS }
  validates :body, presence: true

  default_scope { order(created_at: :desc) }
end
